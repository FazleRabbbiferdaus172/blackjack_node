"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const mockDb_1 = __importDefault(require("../services/mockDb"));
const router = express_1.default.Router();
// Record game result and update user stats
router.post('/result', auth_1.authenticateToken, async (req, res) => {
    try {
        const { result, bet, playerScore, dealerScore } = req.body;
        const userId = req.user.userId;
        // Find user
        const user = await mockDb_1.default.findOne({ _id: userId });
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
        const updatedUser = await mockDb_1.default.findByIdAndUpdate(userId, {
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
    }
    catch (error) {
        console.error('Error recording game result:', error);
        res.status(500).json({ message: 'Error recording game result' });
    }
});
exports.default = router;
