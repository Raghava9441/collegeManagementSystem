// import dotenv from 'dotenv';
const dotenv = require('dotenv');
import logger from './utils/logger';
import { app } from './app';
import connectDB from './db';
import swaggerDocs from './utils/swagger';
import { createServer } from 'http';
import { initializeSocket } from 'socket';

dotenv.config({
    path: './.env',
});

const port = process.env.PORT || 8000; // Use environment variable or default to 8000

// Create an HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

connectDB().then(() => {
    swaggerDocs(app, port as string);
    // Start the HTTP server
    httpServer.listen(port, () => {
        logger.info(`Server running at http://localhost:${port}`);
    });
}).catch((error) => {
    logger.error(error);
});
