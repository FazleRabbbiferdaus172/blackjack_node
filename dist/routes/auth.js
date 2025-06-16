"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cognito_1 = require("../services/cognito");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        // Check if user already exists in DynamoDB
        const existingUser = await User_1.UserModel.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Sign up with Cognito
        const signUpResult = await cognito_1.CognitoService.signUp(username, password, email);
        if (!signUpResult.success) {
            return res.status(400).json({ message: signUpResult.error });
        }
        // Create user in DynamoDB
        const user = await User_1.UserModel.create({
            username,
            password: '', // We don't store passwords in DynamoDB anymore
            balance: 100,
            gamesPlayed: 0,
            gamesWon: 0
        });
        res.status(201).json({
            message: 'User registered successfully. Please check your email for verification code.',
            user: {
                id: user.userId,
                username: user.username,
                gamesWon: user.gamesWon,
                gamesPlayed: user.gamesPlayed,
                balance: user.balance
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});
// Confirm registration
router.post('/confirm', async (req, res) => {
    try {
        const { username, code } = req.body;
        const result = await cognito_1.CognitoService.confirmSignUp(username, code);
        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }
        res.json({ message: 'User confirmed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error confirming user' });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Find user in DynamoDB
        const user = await User_1.UserModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Sign in with Cognito
        const signInResult = await cognito_1.CognitoService.signIn(username, password);
        if (!signInResult.success) {
            return res.status(401).json({ message: signInResult.error });
        }
        res.json({
            tokens: signInResult.tokens,
            user: {
                id: user.userId,
                username: user.username,
                gamesWon: user.gamesWon,
                gamesPlayed: user.gamesPlayed,
                balance: user.balance
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});
exports.default = router;
