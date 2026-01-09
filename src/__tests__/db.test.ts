import mongoose from 'mongoose';
import connectDB from '../db';
import { DB_NAME } from '../constants';
import logger from '../utils/logger';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    host: 'localhost',
    readyState: 0,
    close: jest.fn()
  }
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('Database Connection Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset mongoose connection readyState
    (mongoose.connection.readyState as any) = 0;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should connect to the database successfully', async () => {
    // Mock successful connection
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(mongoose);
    (mongoose.connection.readyState as any) = 1;

    // await connectDB();
    
    
    expect(mongoose.connect).toHaveBeenCalledWith(`${process.env.MONGODB_URI}/${DB_NAME}`);
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle connection errors gracefully', async () => {
    // Mock connection error
    const error = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

    // await connectDB();
    
    expect(logger.error).toHaveBeenCalled();
  });
}); 