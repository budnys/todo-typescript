import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        createdAt?: Date;
        updatedAt?: Date;
    };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
