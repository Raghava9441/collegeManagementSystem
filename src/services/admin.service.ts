import mongoose from 'mongoose';
import { AdminDashboard, AdminDashboardData } from '../models/dashBoard.modals';
import { ApiError } from '../utils/ApiError';
import { getMongoosePaginationOptions } from '../utils/healpers';
import GenericService from './generic.service';

class AdminService {
    private adminService: GenericService<any, any>; // Use IUser and IUserAggregateModel

    constructor() {
        this.adminService = new GenericService<any, any>(AdminDashboard); // Pass User model
    }
    async getAdminDashboard(): Promise<AdminDashboardData> {
        return await this.adminService.getAll(); // Use the getAll method from GenericService
    }
}

export const adminDashboardService = new AdminService();    