import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo API',
            version: '1.0.0',
            description: 'A simple Todo API with authentication',
        },
        servers: [
            {
                url: '/',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
        paths: {
            '/': {
                get: {
                    tags: ['Info'],
                    summary: 'Get API information',
                    description: 'Returns API information and available routes',
                    responses: {
                        '200': {
                            description: 'Successful response',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Todo API Server'
                                            },
                                            docs: {
                                                type: 'string',
                                                example: '/api-docs'
                                            },
                                            routes: {
                                                type: 'object',
                                                properties: {
                                                    auth: {
                                                        type: 'string',
                                                        example: '/auth'
                                                    },
                                                    todos: {
                                                        type: 'string',
                                                        example: '/todos'
                                                    },
                                                    documentation: {
                                                        type: 'string',
                                                        example: '/api-docs'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [
        path.resolve(__dirname, './routes/auth.ts'),
        path.resolve(__dirname, './routes/todo.ts'),
        // Include the compiled JavaScript files as well
        path.resolve(__dirname, '../dist/routes/auth.js'),
        path.resolve(__dirname, '../dist/routes/todo.js')
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
