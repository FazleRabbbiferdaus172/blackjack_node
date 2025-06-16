import express from 'express';
import mockDb from '../services/mockDb';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await mockDb.find({}, { wins: -1 }, 50); // Get more users to calculate winRate properly

        // Calculate winRate for each user and format the leaderboard
        const leaderboard = users.map(user => ({
            username: user.username,
            wins: user.wins || 0,
            gamesPlayed: user.gamesPlayed || 0,
            winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0
        }));

        // Sort by wins (descending), then by winRate (descending) as tiebreaker
        leaderboard.sort((a, b) => {
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return b.winRate - a.winRate;
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

export default router; 