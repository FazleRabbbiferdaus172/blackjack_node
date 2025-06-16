import { Request, Response, NextFunction } from 'express';
import { CognitoService } from '../services/cognito';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
    };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        const verifyResult = await CognitoService.verifyToken(token);
        if (!verifyResult.success) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Add user info to request
        req.user = {
            userId: verifyResult.user!.userId!,
            username: verifyResult.user!.username!
        };

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error authenticating token' });
    }
}; 