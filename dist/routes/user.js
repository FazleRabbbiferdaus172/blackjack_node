"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mockDb_1 = __importDefault(require("../services/mockDb"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { username } = req.body;
        // Check if username is already taken by another user
        const existingUser = await mockDb_1.default.findOne({ username });
        if (existingUser && existingUser._id !== userId) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        const updatedUser = await mockDb_1.default.findByIdAndUpdate(userId, { username });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});
// Change password
router.put('/password', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;
        const user = await mockDb_1.default.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Update password (in a real app, we would hash this)
        await mockDb_1.default.findByIdAndUpdate(userId, { password: newPassword });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password' });
    }
});
// Purchase balance
router.post('/purchase-balance', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        const user = await mockDb_1.default.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // In a real app, you would process payment here
        // For now, we'll just add the balance
        const newBalance = (user.balance || 1000) + amount;
        await mockDb_1.default.findByIdAndUpdate(userId, { balance: newBalance });
        res.json({
            message: 'Balance purchased successfully',
            newBalance
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error purchasing balance' });
    }
});
// Get user balance
router.get('/balance', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await mockDb_1.default.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            balance: user.balance || 1000
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching balance' });
    }
});
exports.default = router;
