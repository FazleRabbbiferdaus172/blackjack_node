import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = express.Router();

// Record game result and update user stats
router.post('/result', authenticateToken, async (req: any, res) => {
    try {
        const { result, bet } = req.body;
        const username = req.user.username;

        // Find user by username instead of userId
        const user = await UserModel.findByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate new balance and stats
        let newBalance = user.balance;
        let newGamesWon = user.gamesWon;
        let newGamesPlayed = user.gamesPlayed + 1;

        switch (result) {
            case 'win':
                newBalance += bet;
                newGamesWon += 1;
                break;
            case 'loss':
                newBalance -= bet;
                break;
            case 'push':
                // Balance stays the same
                break;
            default:
                return res.status(400).json({ message: 'Invalid result' });
        }

        // Ensure balance doesn't go negative
        newBalance = Math.max(0, newBalance);

        // Update user in database
        await UserModel.updateBalance(user.userId, newBalance);
        await UserModel.updateStats(user.userId, result === 'win');

        res.json({
            newBalance,
            gamesWon: newGamesWon,
            gamesPlayed: newGamesPlayed
        });
    } catch (error) {
        console.error('Error recording game result:', error);
        res.status(500).json({ message: 'Error recording game result' });
    }
});

export default router; 