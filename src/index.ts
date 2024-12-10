import 'dotenv/config'
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import todoRoutes from './routes/todo';
import authRoutes from './routes/auth';
import { initializeDatabase } from './data-source';
import { swaggerSpec } from './swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Todo API Server',
        docs: '/api-docs',
        routes: {
            auth: '/auth',
            todos: '/todos'
        }
    });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
}));

// Initialize database connection
console.log('Initializing database connection...');
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(error => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });
