import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import mockDb from '../services/mockDb';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await mockDb.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create new user
        const user = await mockDb.create({
            username,
            password, // In a real app, we would hash this
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                wins: user.wins,
                gamesPlayed: user.gamesPlayed,
                balance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await mockDb.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                wins: user.wins,
                gamesPlayed: user.gamesPlayed,
                balance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

export default router; 