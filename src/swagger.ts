import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import type { Express } from "express"

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js TS API Docs",
      version: "1.0.0",
      description: `API documentation for my Node.js, Typescript, and db`,
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
  },

  apis: ['./src/docs/*.yaml', './src/docs/*.yml'],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
