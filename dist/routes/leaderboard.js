"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get leaderboard
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const users = await User_1.UserModel.getLeaderboard(50); // Get more users to calculate winRate properly
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});
exports.default = router;
