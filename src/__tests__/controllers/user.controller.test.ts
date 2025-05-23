import { Request, Response } from 'express';
import { userService } from '../../services/user.service';
import { User } from '../../models/user.models';
import mongoose from 'mongoose';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

// Mock the userService and User model
jest.mock('../../services/user.service');
jest.mock('../../models/user.models');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [
        {
          _id: new mongoose.Types.ObjectId(),
          username: 'user1',
          email: 'user1@example.com',
          fullname: 'User One',
          role: 'STUDENT',
          gender: 'male',
          organizationId: new mongoose.Types.ObjectId().toString(),
          avatar: '',
          activityStatus: 'Hey There! I ❤️ Using CMS 😸',
          onlineStatus: 'offline',
          refreshToken: '',
          friends: []
        },
        {
          _id: new mongoose.Types.ObjectId(),
          username: 'user2',
          email: 'user2@example.com',
          fullname: 'User Two',
          role: 'TEACHER',
          gender: 'female',
          organizationId: new mongoose.Types.ObjectId().toString(),
          avatar: '',
          activityStatus: 'Hey There! I ❤️ Using CMS 😸',
          onlineStatus: 'offline',
          refreshToken: '',
          friends: []
        }
      ];

      mockRequest.user = {
        _id: new mongoose.Types.ObjectId(),
        username: 'admin',
        email: 'admin@example.com',
        fullname: 'Admin User',
        role: 'ADMIN',
        gender: 'male',
        organizationId: new mongoose.Types.ObjectId().toString(),
        avatar: '',
        activityStatus: 'Hey There! I ❤️ Using CMS 😸',
        onlineStatus: 'offline',
        refreshToken: '',
        friends: []
      };
      mockRequest.query = { page: '1', limit: '10' };

      (User.aggregate as jest.Mock).mockReturnValueOnce([]);
      (User.aggregatePaginate as jest.Mock).mockResolvedValueOnce({
        users: mockUsers,
        totalUsers: 2,
        page: 1,
        limit: 10
      });

      await userService.getAllUsers();

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            users: mockUsers
          })
        })
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        fullname: 'New User',
        role: 'STUDENT',
        gender: 'male',
        organizationId: new mongoose.Types.ObjectId().toString(),
        avatar: '',
        activityStatus: 'Hey There! I ❤️ Using CMS 😸',
        onlineStatus: 'offline',
        refreshToken: '',
        friends: []
      };

      const mockCreatedUser = {
        _id: new mongoose.Types.ObjectId(),
        ...userData
      };

      mockRequest.body = userData;
      (userService.createUser as jest.Mock).mockResolvedValueOnce(mockCreatedUser);

      await userService.createUser(userData);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCreatedUser
        })
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com'
        // Missing required fields
      };

      mockRequest.body = userData;

      await expect(userService.createUser(userData)).rejects.toThrow(ApiError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockRequest.params = { userId: userId.toString() };
      (User.findById as jest.Mock).mockResolvedValueOnce({
        _id: userId,
        organizationId: new mongoose.Types.ObjectId().toString()
      });
      (User.deleteOne as jest.Mock).mockResolvedValueOnce({ deletedCount: 1 });

      await userService.deleteUser(userId.toString());

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User is deleted successfully'
        })
      );
    });

    it('should return 404 when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      mockRequest.params = { userId: userId.toString() };
      (User.findById as jest.Mock).mockResolvedValueOnce(null);

      await expect(userService.deleteUser(userId.toString())).rejects.toThrow(ApiError);
    });
  });
}); 