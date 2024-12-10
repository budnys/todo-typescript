import { Router, Request, Response } from 'express';
import { User } from '../entities/User';
import AppDataSource from '../data-source';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

interface AuthData {
    username: string;
    password: string;
}

const router = Router();

// Password validation middleware
const passwordValidation = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character');

// Username validation middleware
const usernameValidation = body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores');

/**
 * Hash password with salt and pepper
 */
const hashPassword = async (password: string): Promise<string> => {
    const pepperedPassword = password + process.env.PASSWORD_PEPPER || 'default-pepper';
    return bcrypt.hash(pepperedPassword, parseInt(process.env.BCRYPT_ROUNDS || '12'));
};

/**
 * Verify password with salt and pepper
 */
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const pepperedPassword = password + process.env.PASSWORD_PEPPER || 'default-pepper';
    return bcrypt.compare(pepperedPassword, hashedPassword);
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: Username already exists or invalid input
 */
router.post('/register',
    usernameValidation,
    passwordValidation,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userRepository = AppDataSource.getRepository(User);
            const userData: AuthData = req.body as AuthData;

            // Check if user exists
            const existingUser = await userRepository.findOne({ where: { username: userData.username } });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Hash password with salt and pepper
            const hashedPassword = await hashPassword(userData.password);

            // Create user
            const user = userRepository.create({
                username: userData.username,
                password: hashedPassword
            });

            await userRepository.save(user);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );

            // Don't send password back in response
            const { password: _, ...userWithoutPassword } = user;
            return res.status(201).json({ 
                user: {
                    ...userWithoutPassword,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }, 
                token 
            });

        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ error: 'Failed to register user' });
        }
    }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
    usernameValidation,
    passwordValidation,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userRepository = AppDataSource.getRepository(User);
            const userData: AuthData = req.body as AuthData;

            // Find user
            const user = await userRepository.findOne({ where: { username: userData.username } });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isValidPassword = await verifyPassword(userData.password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );

            // Don't send password back in response
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({ 
                user: {
                    ...userWithoutPassword,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }, 
                token 
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Failed to login' });
        }
    }
);

export default router;
