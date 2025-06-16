import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import userRoutes from './routes/user';
import leaderboardRoutes from './routes/leaderboard';

const app = express();

// Force new deployment - authentication removed from routes
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export const handler = serverless(app);