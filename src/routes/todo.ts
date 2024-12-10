import { Router, Response } from 'express';
import AppDataSource from '../data-source';
import { Todo } from '../entities/Todo';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the todo
 *         title:
 *           type: string
 *           description: The title of the todo
 *         completed:
 *           type: boolean
 *           description: Whether the todo is completed
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date of the todo creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the todo was last updated
 */

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               completed:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        console.log('Creating todo with data:', {
            body: req.body,
            user: req.user
        });
        
        const todoRepository = AppDataSource.getRepository(Todo);
        const todo = todoRepository.create({
            description: req.body.title,
            completed: req.body.completed || false,
            user: { id: req.user?.id }
        });
        
        console.log('Todo object before save:', todo);
        
        const savedTodo = await todoRepository.save(todo);
        console.log('Todo saved successfully:', savedTodo);
        
        const response = {
            ...savedTodo,
            title: savedTodo.description,
        };
        
        return res.status(201).json(response);
    } catch (error) {
        console.error('Error creating todo:', error);
        return res.status(400).json({ 
            error: 'Failed to create todo',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all todos for the authenticated user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const todoRepository = AppDataSource.getRepository(Todo);
        const todos = await todoRepository.find({
            where: { user: { id: req.user?.id } }
        });
        return res.status(200).json(todos);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The todo id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const todoRepository = AppDataSource.getRepository(Todo);
        const todo = await todoRepository.findOne({
            where: { 
                id: parseInt(req.params.id),
                user: { id: req.user?.id }
            }
        });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        todoRepository.merge(todo, { description: req.body.title, completed: req.body.completed });
        await todoRepository.save(todo);
        return res.status(200).json(todo);
    } catch (error) {
        return res.status(400).json({ error: 'Failed to update todo' });
    }
});

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The todo id
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const todoRepository = AppDataSource.getRepository(Todo);
        const todo = await todoRepository.findOne({
            where: { 
                id: parseInt(req.params.id),
                user: { id: req.user?.id }
            }
        });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        await todoRepository.remove(todo);
        return res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        return res.status(400).json({ error: 'Failed to delete todo' });
    }
});

export default router;
