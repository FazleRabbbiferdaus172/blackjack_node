import express from 'express';
import mockDb from '../services/mockDb';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
    user?: {
        userId: string;
    };
}

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { userId } = req.user!;
        const { username } = req.body;

        // Check if username is already taken by another user
        const existingUser = await mockDb.findOne({ username });
        if (existingUser && existingUser._id !== userId) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const updatedUser = await mockDb.findByIdAndUpdate(userId, { username });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                wins: updatedUser.wins,
                gamesPlayed: updatedUser.gamesPlayed
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change password
router.put('/password', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { userId } = req.user!;
        const { currentPassword, newPassword } = req.body;

        const user = await mockDb.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password (in a real app, we would hash this)
        await mockDb.findByIdAndUpdate(userId, { password: newPassword });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password' });
    }
});

// Purchase balance
router.post('/purchase-balance', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { userId } = req.user!;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const user = await mockDb.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // In a real app, you would process payment here
        // For now, we'll just add the balance
        const currentBalance = user.balance !== undefined ? user.balance : 1000;
        const newBalance = currentBalance + amount;
        await mockDb.findByIdAndUpdate(userId, { balance: newBalance });

        res.json({
            message: 'Balance purchased successfully',
            newBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error purchasing balance' });
    }
});

// Get user balance
router.get('/balance', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { userId } = req.user!;

        const user = await mockDb.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            balance: user.balance || 1000
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching balance' });
    }
});

export default router; 