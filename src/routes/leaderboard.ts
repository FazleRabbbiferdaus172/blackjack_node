import express from 'express';
import { UserModel } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await UserModel.getLeaderboard(50); // Get more users to calculate winRate properly

        // Calculate winRate for each user and format the leaderboard
        const leaderboard = users.map(user => ({
            username: user.username,
            gamesWon: user.gamesWon || 0,
            gamesPlayed: user.gamesPlayed || 0,
            winRate: user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0
        }));

        // Sort by gamesWon (descending), then by winRate (descending) as tiebreaker
        leaderboard.sort((a, b) => {
            if (b.gamesWon !== a.gamesWon) {
                return b.gamesWon - a.gamesWon;
            }
            return b.winRate - a.winRate;
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

export default router; 