import { Request, Response, NextFunction } from 'express';
import { getAdminDashBoard } from '../../controllers/admin.controllers';
import { adminDashboardService } from '../../services/admin.service';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';

// Mock the admin service
jest.mock('../../services/admin.service');

describe('AdminController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let responseObject: any;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return mockResponse;
            })
        };
        mockNext = jest.fn();
        responseObject = {};
    });

    describe('getAdminDashBoard', () => {
        it('should return admin dashboard data successfully', async () => {
            const mockDashboardData = {
                role: 'admin',
                counts: {
                    adminCount: 5,
                    teacherCount: 10,
                    studentCount: 50,
                    parentCount: 20
                },
                studentStats: {
                    maleCount: 30,
                    femaleCount: 20
                },
                attendanceStats: {
                    presentCount: 40,
                    absentCount: 10,
                    year: 2024
                },
                events: []
            };

            (adminDashboardService.getAdminDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

            await getAdminDashBoard(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: mockDashboardData,
                message: "Admin dashboard is fetched successfully",
                success: true
            });
        });

        it('should handle case when dashboard data is not found', async () => {
            (adminDashboardService.getAdminDashboard as jest.Mock).mockResolvedValue(null);

            await getAdminDashBoard(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                new ApiError(404, null, "Admin dashboard is not found", undefined, [{ msg: "Admin dashboard is not found" }])
            );
        });

        it('should handle service errors', async () => {
            const error = new Error('Service error');
            (adminDashboardService.getAdminDashboard as jest.Mock).mockRejectedValue(error);

            await getAdminDashBoard(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
}); 