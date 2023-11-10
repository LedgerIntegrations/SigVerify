const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
const pool = require('./config/db');
require('dotenv').config();

// const xrplRoutes = require('./routes/xrplRoutes');
// const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(cors());
app.use(express.json());

// test route not needed can delete
app.get('/', (req, res) => {
  res.send("You have reached the sigVerify server!");
});

// imported routes
app.use(userRoutes);
// app.use(documentRoutes);
// app.use(xrplRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
