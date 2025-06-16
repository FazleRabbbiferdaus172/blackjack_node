"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const cognito_1 = require("../services/cognito");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        // Verify token with Cognito
        const verifyResult = await cognito_1.CognitoService.verifyToken(token);
        if (!verifyResult.success) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        // Add user info to request
        req.user = {
            userId: verifyResult.user.userId,
            username: verifyResult.user.username
        };
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Error authenticating token' });
    }
};
exports.authenticateToken = authenticateToken;
