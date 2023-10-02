const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');

// const multer = require('multer');
// const storage = multer.memoryStorage(); // Store the file data in memory
// const upload = multer({ storage: storage });
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes')

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Server has recieved your get request!");
});

// Use imported routes
app.use(userRoutes);
app.use(documentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
