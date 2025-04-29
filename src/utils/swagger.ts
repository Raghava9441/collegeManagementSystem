import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import logger from "./logger";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "College Management System",
            version: version,
            description: "This is a college management system for all the education institutes",
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: "Localhost",
            },
        ],
        tags: [
            {
                name: "api",
                description: "All the APIs",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number | string) {
    // logger.info("Initializing Swagger docs");

    // Swagger page
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Docs in JSON format 
    app.get("/api-docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    // logger.info(`Swagger docs are ready at http://localhost:${port}/api-docs`);
}

export default swaggerDocs;