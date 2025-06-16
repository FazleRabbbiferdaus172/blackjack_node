import express from 'express';
import { authenticateToken } from '../middleware/auth';
import mockDb from '../services/mockDb';

const router = express.Router();

// Record game result and update user stats
router.post('/result', authenticateToken, async (req: any, res) => {
    try {
        const { result, bet, playerScore, dealerScore } = req.body;
        const userId = req.user.userId;

        // Find user
        const user = await mockDb.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate new balance
        let newBalance = user.balance;
        let newWins = user.wins;
        let newGamesPlayed = user.gamesPlayed + 1;

        switch (result) {
            case 'win':
                newBalance += bet;
                newWins += 1;
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
        const updatedUser = await mockDb.findByIdAndUpdate(userId, {
            balance: newBalance,
            wins: newWins,
            gamesPlayed: newGamesPlayed
        });

        if (!updatedUser) {
            return res.status(500).json({ message: 'Failed to update user' });
        }

        res.json({
            newBalance,
            wins: newWins,
            gamesPlayed: newGamesPlayed
        });
    } catch (error) {
        console.error('Error recording game result:', error);
        res.status(500).json({ message: 'Error recording game result' });
    }
});

export default router; 