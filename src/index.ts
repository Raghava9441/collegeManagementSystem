import dotenv from 'dotenv';
import logger from './utils/logger';

import { app } from './app';
import connectDB from './db';

dotenv.config({
    path: './.env',
});

const port = process.env.PORT || 8000; // Use environment variable or default to 8000

connectDB().then(() => {
    app.listen(port, () => {
        logger.info(`Server running at http://localhost:${port}`);
    });
}).catch((error) => {
    logger.error(error);
});

