import dotenv from 'dotenv';
import logger from './utils/logger';
import { app } from './app';
// import connectDB from './db';
import swaggerDocs from './utils/swagger';
import { createServer } from 'http';
import { initializeSocket } from './socket';
import dbConnection from './db';


dotenv.config({
    path: './.env',
});

const port = process.env.PORT || 8000; // Use environment variable or default to 8000
const serverIp = process.env.HOST || 'http://localhost';
// Create an HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// connectDB().then(() => {
//     swaggerDocs(app, port as string);
//     // Start the HTTP server
//     httpServer.listen(port, () => {
//         logger.info(`Server running at ${serverIp}:${port}`);
//     });
// }).catch((error) => {
//     logger.error(error);
// });


dbConnection.connect().then(() => {
    swaggerDocs(app, port as string);
    // Start the HTTP server
    httpServer.listen(port, () => {
        logger.info(`Server running at ${serverIp}:${port}`);
    });

    // Handle server listen errors
    httpServer.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
            logger.error(`Port ${port} is already in use. Please free the port or use a different port.`);
            process.exit(1);
        }
        logger.error(`Server error: ${error.message}`);
        process.exit(1);
    });
}).catch((error) => {
    logger.error(error);
    process.exit(1);
});