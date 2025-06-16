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

// AWS Lambda handler
export const handler = (event: any, context: any) => {
    console.log('Lambda invoked with event:', JSON.stringify(event, null, 2));

    // For API Gateway events
    if (event.httpMethod) {
        const serverlessExpress = require('@vendia/serverless-express');
        return serverlessExpress({ app })(event, context);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Lambda function is running' })
    };
};