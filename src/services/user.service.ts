import { IUser, IUserAggregateModel, User } from '../models/user.models';
import GenericService from './generic.service';
import { ApiError } from '../utils/ApiError';
import bcrypt from 'bcrypt';
class UserService {
    private userService: GenericService<IUser, IUserAggregateModel>; // Use IUser and IUserAggregateModel

    constructor() {
        this.userService = new GenericService<IUser, IUserAggregateModel>(User); // Pass User model
    }

    // Create a new user
    async createUser(userData: any) {
        const { username, email, fullname, avatar, coverImage, age, role, gender, organizationId, phone, address, status, dateOfBirth, biography, permissions, socialLinks, preferences, teacherId, parentId, studentId } = userData;

        // Check for existing user
        const existingUser = await this.userService.findOne({
            $or: [
                { username },
                { email },
            ]
        });

        if (existingUser) {
            throw new ApiError(409, null, 'User creation failed', undefined, [{ msg: 'A user with the same username or email already exists' }]);
        }

        // Hash the password before saving (dummy password for demonstration)
        const dummyPassword = "DummyPassword123";
        const hashedPassword = await bcrypt.hash(dummyPassword, 10);

        // Create user using the generic service
        const user = await this.userService.create({
            username,
            email,
            fullname,
            avatar,
            coverImage,
            age,
            role,
            gender,
            organizationId,
            phone,
            address,
            status,
            dateOfBirth,
            biography,
            permissions,
            socialLinks,
            preferences,
            teacherId,
            parentId,
            studentId,
            password: dummyPassword,
            // refreshToken
        });

        return user;
    }

    // Get all users
    async getAllUsers() {
        return await this.userService.getAll();
    }

    // Get user by ID
    async getUserById(userId: string) {
        return await this.userService.getById(userId);
    }

    // Update user by ID
    async updateUser(userId: string, updateData: any) {
        return await this.userService.update(userId, updateData);
    }

    // Delete user by ID
    async deleteUser(userId: string) {
        return await this.userService.delete(userId);
    }
}

export const userService = new UserService();