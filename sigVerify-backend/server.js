// /sigVerify-backend/server.js

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3001;
const cors = require('cors');
const pool = require('./config/db');
require('dotenv').config();

const xrplRoutes = require('./routes/xrplRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, // This allows cookies and credentials to be sent
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// test route not needed can delete
app.get('/', (req, res) => {
  res.send("You have reached the sigVerify server!");
});

// imported routes
app.use(userRoutes);
app.use(documentRoutes);
app.use(xrplRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
