// /sigVerify-backend/server.js

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import xrplRoutes from './routes/xrplRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import signatureRoutes from './routes/signatureRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

const app = express();

// Determine the environment and set base URL and CORS origins accordingly
const environment = process.env.NODE_ENV || 'development';

console.log("server environment: ", environment)
const baseUrl = environment === 'production' ? process.env.PROD_BASE_URL : 'http://localhost';

const corsOrigins =
    // environment === 'production' ? [process.env.PROD_BASE_URL] : ['http://localhost:5173', 'http://localhost:3000'];
   ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];


const corsOptions = {
    origin: corsOrigins,
    credentials: true, // This allows cookies and credentials to be sent
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// modular routes
app.use(userRoutes);
app.use(xrplRoutes);
app.use(documentRoutes);
app.use(signatureRoutes);

// Serve static files and support client-side routing in production
if (environment === 'production') {
    app.use(express.static(path.join(__dirname, '../sigVerify-frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../sigVerify-frontend/dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on ${baseUrl}:${PORT}`);
});
