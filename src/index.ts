import dotenv from 'dotenv';
import logger from './utils/logger';

import { app } from './app';
import connectDB from './db';
import swaggerDocs from './utils/swagger';

dotenv.config({
    path: './.env',
});

const port = process.env.PORT; // Use environment variable or default to 8000

connectDB().then(() => {
    swaggerDocs(app, port as string);
    app.listen(port, () => {
        logger.info(`Server running at http://localhost:${process.env.PORT}`);
    });
}).catch((error) => {
    logger.error(error);
});

