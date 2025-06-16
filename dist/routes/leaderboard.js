"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockDb_1 = __importDefault(require("../services/mockDb"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get leaderboard
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const users = await mockDb_1.default.find({}, { wins: -1 }, 50); // Get more users to calculate winRate properly
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});
exports.default = router;
