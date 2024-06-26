import mongoose from 'mongoose';
import { DB_NAME } from '../constants';
import logger from '../utils/logger';


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        logger.info(`\n MongoDB connected: ${connectionInstance.connection.host}`);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error(error);
    }
};

export default connectDB;