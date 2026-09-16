import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import issuesRoutes from './modules/issues/issuesRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

app.get('/api/health', (req, res) =>{
    res.json({
        success: true,
        message: "Server is running"
    })
})

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

export default app;