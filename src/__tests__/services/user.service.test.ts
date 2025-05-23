import { userService } from '../../services/user.service';
import { User } from '../../models/user.models';
import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError';

// Mock the User model
jest.mock('../../models/user.models');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        fullname: 'Test User',
        role: 'STUDENT',
        gender: 'male',
        organizationId: new mongoose.Types.ObjectId().toString(),
        avatar: '',
        activityStatus: 'Hey There! I ❤️ Using CMS 😸',
        onlineStatus: 'offline',
        refreshToken: '',
        friends: []
      };

      (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.getUserById(mockUser._id.toString());
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should return null when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      (User.findById as jest.Mock).mockResolvedValueOnce(null);

      const result = await userService.getUserById(userId.toString());
      expect(result).toBeNull();
      expect(User.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com'
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.getUserByEmail('test@example.com');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await userService.getUserByEmail('nonexistent@example.com');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
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

      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      (User.create as jest.Mock).mockResolvedValueOnce(mockCreatedUser);

      const result = await userService.createUser(userData);
      expect(result).toEqual(mockCreatedUser);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining(userData));
    });

    it('should throw error when user already exists', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        fullname: 'Existing User',
        role: 'STUDENT',
        gender: 'male',
        organizationId: new mongoose.Types.ObjectId().toString(),
        avatar: '',
        activityStatus: 'Hey There! I ❤️ Using CMS 😸',
        onlineStatus: 'offline',
        refreshToken: '',
        friends: []
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce({ ...userData, _id: new mongoose.Types.ObjectId() });

      await expect(userService.createUser(userData)).rejects.toThrow(ApiError);
    });

    it('should throw error when required fields are missing', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com'
        // Missing required fields
      };

      (User.findOne as jest.Mock).mockResolvedValueOnce(null);
      (User.create as jest.Mock).mockRejectedValueOnce(new Error('Validation failed'));

      await expect(userService.createUser(userData)).rejects.toThrow(ApiError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const mockUpdatedUser = {
        _id: userId,
        ...updateData,
        fullname: 'Test User',
        role: 'STUDENT',
        gender: 'male',
        organizationId: new mongoose.Types.ObjectId().toString(),
        avatar: '',
        activityStatus: 'Hey There! I ❤️ Using CMS 😸',
        onlineStatus: 'offline',
        refreshToken: '',
        friends: []
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(mockUpdatedUser);

      const result = await userService.updateUser(userId.toString(), updateData);
      expect(result).toEqual(mockUpdatedUser);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true }
      );
    });

    it('should return null when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      const updateData = {
        username: 'updateduser'
      };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);

      const result = await userService.updateUser(userId.toString(), updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      (User.findByIdAndDelete as jest.Mock).mockResolvedValueOnce({ _id: userId });

      const result = await userService.deleteUser(userId.toString());
      expect(result).toBe(true);
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should return false when user not found', async () => {
      const userId = new mongoose.Types.ObjectId();
      (User.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(null);

      const result = await userService.deleteUser(userId.toString());
      expect(result).toBe(false);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
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

      (User.find as jest.Mock).mockResolvedValueOnce(mockUsers);

      const result = await userService.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalled();
    });
  });
}); 