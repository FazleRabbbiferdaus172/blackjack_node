"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { username } = req.body;
        // Check if username is already taken by another user
        const existingUser = await User_1.UserModel.findByUsername(username);
        if (existingUser && existingUser.userId !== userId) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        // Update username
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.username = username;
        await User_1.UserModel.create(user); // Overwrite user with new username
        res.json({
            user: {
                id: user.userId,
                username: user.username,
                gamesWon: user.gamesWon,
                gamesPlayed: user.gamesPlayed
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
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Update password (hash it)
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        await User_1.UserModel.create(user); // Overwrite user with new password
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
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Add the balance
        const currentBalance = user.balance !== undefined ? user.balance : 100;
        const newBalance = currentBalance + amount;
        await User_1.UserModel.updateBalance(userId, newBalance);
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
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            balance: user.balance || 100
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching balance' });
    }
});
exports.default = router;
