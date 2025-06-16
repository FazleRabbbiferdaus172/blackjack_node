"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Record game result and update user stats
router.post('/result', auth_1.authenticateToken, async (req, res) => {
    try {
        const { result, bet } = req.body;
        const username = req.user.username;
        // Find user by username instead of userId
        const user = await User_1.UserModel.findByUsername(username);
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
        await User_1.UserModel.updateBalance(user.userId, newBalance);
        await User_1.UserModel.updateStats(user.userId, result === 'win');
        res.json({
            newBalance,
            gamesWon: newGamesWon,
            gamesPlayed: newGamesPlayed
        });
    }
    catch (error) {
        console.error('Error recording game result:', error);
        res.status(500).json({ message: 'Error recording game result' });
    }
});
exports.default = router;
