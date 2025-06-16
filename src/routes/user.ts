import express from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
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
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser && existingUser.userId !== userId) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Update username
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.username = username;
        await UserModel.create(user); // Overwrite user with new username

        res.json({
            user: {
                id: user.userId,
                username: user.username,
                gamesWon: user.gamesWon,
                gamesPlayed: user.gamesPlayed
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

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password (hash it)
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await UserModel.create(user); // Overwrite user with new password

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

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add the balance
        const currentBalance = user.balance !== undefined ? user.balance : 100;
        const newBalance = currentBalance + amount;
        await UserModel.updateBalance(userId, newBalance);

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

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            balance: user.balance || 100
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching balance' });
    }
});

export default router; 