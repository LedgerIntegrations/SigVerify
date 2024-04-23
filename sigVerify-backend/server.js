// /sigVerify-backend/server.js

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import xrplRoutes from './routes/xrplRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import signatureRoutes from './routes/signatureRoutes.js'

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

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

// modular routes
app.use(userRoutes);
app.use(xrplRoutes);
app.use(documentRoutes);
app.use(signatureRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});