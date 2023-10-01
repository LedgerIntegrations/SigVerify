const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const crypto = require('crypto');
const cors = require('cors');

const multer = require('multer');
const storage = multer.memoryStorage(); // Store the file data in memory
const upload = multer({ storage: storage });

app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Mock user's private key (in a real-world scenario, NEVER hardcode this and NEVER expose it)
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'sect239k1'
});

app.get('/', (req, res) => {
  res.send("api is working")
})

// Endpoint to create a signature
app.post('/api/sign', upload.single('document'), (req, res) => {
  try {
    console.log(req.file);  // The uploaded file data is available in req.file
    const document = req.file.buffer; // Buffer of the uploaded file

    if (!document) {
      return res.status(400).json({ error: "No document provided" });
    }

    // Create a hash of the document
    const hash = crypto.createHash('sha256').update(document).digest();

    // Sign the hash using the user's private key
    const signature = crypto.sign(null, hash, privateKey).toString('hex');

    res.json({
      document: document.toString('base64'), // Convert buffer to base64 for sending in JSON
      signature: signature
    });

  } catch (error) {
    console.error("Error while signing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to verify a signature
app.post('/api/verify', upload.single('document'), (req, res) => {
  try {
      const documentBuffer = req.file.buffer; // Buffer of the uploaded file

      // Retrieve the signature from the body or as a part of the form-data
      const signature = req.body.signature 
                        ? Buffer.from(req.body.signature, 'hex') 
                        : null;

      if (!documentBuffer || !signature) {
          return res.status(400).send("Document or signature missing");
      }

      // Create a hash of the document
      const hash = crypto.createHash('sha256').update(documentBuffer).digest();

      // Verify the signature using the user's public key
      const isValid = crypto.verify(null, hash, publicKey, signature);

      res.json({ isValid: isValid });
  } catch (error) {
      console.error("Error while verifying:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
