import mongoose from 'mongoose';
import { DB_NAME } from '../constants';
import logger from '../utils/logger';


// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         logger.info(`\n MongoDB connected: ${connectionInstance.connection.host}`);
//         // logger.info("Connected to MongoDB");
//     } catch (error) {
//         logger.error(error);
//     }
// };

// export default connectDB;


class DatabaseConnection {
    private static instance: DatabaseConnection;
    private connection: typeof mongoose | null = null;

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection()
        }
        return DatabaseConnection.instance;
    };

    public async connect(): Promise<typeof mongoose> {
        if (this.connection) {
            logger.info('Using existing MongoDB connection');
            return this.connection;
        }
        try {
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI is not defined');
            }
            this.connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            logger.info(`MongoDB connected: ${this.connection.connection.host}`)
            this.setupEventHandlers()
            return this.connection;
        } catch (error) {
            logger.error('MongoDB connection failed:', error);
            process.exit(1);
        }
    }

    private setupEventHandlers(): void {
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
            this.connection = null;
        });
    }

    public async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.connection.close();
            this.connection = null;
            logger.info('MongoDB connection closed');
        }
    }
}

export default DatabaseConnection.getInstance();


