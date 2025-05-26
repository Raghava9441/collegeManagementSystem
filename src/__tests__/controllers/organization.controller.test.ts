import { Request, Response, NextFunction } from 'express';
import { Organization } from '../../models/organization.models';
import {
    getAllOrganizations,
    createOrganization,
    createBulkOrganizations,
    deleteOrganizationById,
    getOrganizationById,
    updateOrganizationById,
    deleteBulkOrganizations
} from '../../controllers/organization.controllers';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import * as XLSX from 'xlsx';

// Mock the Organization model
jest.mock('../../models/organization.models');

describe('OrganizationController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let responseObject: any;

    beforeEach(() => {
        mockRequest = {
            user: {
                id: '123',
                role: 'ADMIN',
                organizationId: '123',
                email: 'admin@test.com',
                fullname: 'Admin User',
                avatar: '',
                coverImage: '',
                age: '30',
                gender: 'male',
                phone: '1234567890',
                address: 'Test Address',
                status: 'active',
                dateOfBirth: '1990-01-01',
                biography: '',
                permissions: [],
                socialLinks: {
                    facebook: '',
                    twitter: '',
                    linkedin: ''
                },
                preferences: {
                    notifications: true,
                    language: 'en'
                }
            },
            query: {},
            params: {},
            body: {},
            file: undefined
        };
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

    describe('getAllOrganizations', () => {
        it('should return all organizations for admin user', async () => {
            const mockOrganizations = {
                organizations: [
                    { _id: '1', name: 'Org 1' },
                    { _id: '2', name: 'Org 2' }
                ],
                totalOrganizations: 2,
                page: 1,
                limit: 10
            };

            (Organization.aggregatePaginate as jest.Mock).mockResolvedValue(mockOrganizations);

            await getAllOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: mockOrganizations,
                message: "Organizations are fetched successfully",
                success: true
            });
        });

        it('should return only user\'s organization for non-admin user', async () => {
            mockRequest.user = {
                ...mockRequest.user!,
                role: 'TEACHER',
                organizationId: '123'
            };
            const mockOrganizations = {
                organizations: [{ _id: '123', name: 'User Org' }],
                totalOrganizations: 1,
                page: 1,
                limit: 10
            };

            (Organization.aggregatePaginate as jest.Mock).mockResolvedValue(mockOrganizations);

            await getAllOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(Organization.aggregate).toHaveBeenCalledWith([
                { $match: { _id: expect.any(Object) } }
            ]);
        });

        it('should handle unauthenticated user', async () => {
            mockRequest.user = undefined;

            await getAllOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                new ApiError(401, "User not authenticated")
            );
        });
    });

    describe('createOrganization', () => {
        it('should create a new organization successfully', async () => {
            const mockOrgData = {
                name: 'Test Org',
                category: 'Education',
                number: '123456',
                website: 'test.com',
                contactEmail: 'test@test.com',
                contactPhone: '1234567890'
            };

            mockRequest.body = mockOrgData;
            (Organization.findOne as jest.Mock).mockResolvedValue(null);
            (Organization.create as jest.Mock).mockResolvedValue({ ...mockOrgData, _id: '123' });

            await createOrganization(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: { ...mockOrgData, _id: '123' },
                message: "Organization is created successfully",
                success: true
            });
        });

        it('should handle missing required fields', async () => {
            mockRequest.body = { name: 'Test Org' };

            await createOrganization(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({
                statusCode: 400,
                message: "Please provide all the required fields",
                success: false
            });
        });

        it('should handle duplicate organization', async () => {
            const mockOrgData = {
                name: 'Test Org',
                category: 'Education',
                number: '123456',
                website: 'test.com',
                contactEmail: 'test@test.com',
                contactPhone: '1234567890'
            };

            mockRequest.body = mockOrgData;
            (Organization.findOne as jest.Mock).mockResolvedValue({ _id: '123', ...mockOrgData });

            await createOrganization(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(responseObject).toEqual({
                statusCode: 409,
                message: "An organization with the same name, website, or contact email already exists",
                success: false
            });
        });
    });

    describe('getOrganizationById', () => {
        it('should return organization by id', async () => {
            const mockOrg = {
                _id: '123',
                name: 'Test Org',
                category: 'Education'
            };

            mockRequest.params = { organizationId: '123' };
            (Organization.findById as jest.Mock).mockResolvedValue(mockOrg);

            await getOrganizationById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: mockOrg,
                message: "Organization is fetched successfully",
                success: true
            });
        });

        it('should handle non-existent organization', async () => {
            mockRequest.params = { organizationId: '123' };
            (Organization.findById as jest.Mock).mockResolvedValue(null);

            await getOrganizationById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({
                statusCode: 404,
                message: "Organization is not found",
                success: false
            });
        });
    });

    describe('updateOrganizationById', () => {
        it('should update organization successfully', async () => {
            const mockOrg = {
                _id: '123',
                name: 'Updated Org',
                category: 'Education'
            };

            mockRequest.params = { organizationId: '123' };
            mockRequest.body = { name: 'Updated Org', category: 'Education' };
            (Organization.findById as jest.Mock).mockResolvedValue(mockOrg);
            (Organization.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockOrg);

            await updateOrganizationById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: mockOrg,
                message: "Organization is created successfully",
                success: true
            });
        });

        it('should handle non-existent organization', async () => {
            mockRequest.params = { organizationId: '123' };
            (Organization.findById as jest.Mock).mockResolvedValue(null);

            await updateOrganizationById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({
                statusCode: 404,
                message: "Organization is not found",
                success: false
            });
        });
    });

    describe('deleteOrganizationById', () => {
        it('should delete organization successfully', async () => {
            const mockOrg = {
                _id: '123',
                name: 'Test Org'
            };

            mockRequest.params = { organizationId: '123' };
            (Organization.findById as jest.Mock).mockResolvedValue(mockOrg);
            (Organization.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            await deleteOrganizationById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: "organization is deleted successfully",
                message: "Organization is deleted successfully",
                success: true
            });
        });

        it('should handle non-existent organization', async () => {
            mockRequest.params = { organizationId: '123' };
            (Organization.findById as jest.Mock).mockResolvedValue(null);

            await deleteOrganizationById(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toEqual({
                statusCode: 404,
                message: "Organization is not found",
                success: false
            });
        });
    });

    describe('deleteBulkOrganizations', () => {
        it('should delete multiple organizations successfully', async () => {
            mockRequest.body = { organizationIds: ['123', '456'] };
            (Organization.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

            await deleteBulkOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: "organizations are deleted successfully",
                message: "Organizations are deleted successfully",
                success: true
            });
        });

        it('should handle invalid organizationIds', async () => {
            mockRequest.body = { organizationIds: 'invalid' };

            await deleteBulkOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({
                statusCode: 400,
                message: "Please provide an array of organization ids",
                success: false
            });
        });
    });

    describe('createBulkOrganizations', () => {
        it('should create multiple organizations from Excel file', async () => {
            const mockExcelData = [
                {
                    name: 'Org 1',
                    category: 'Education',
                    number: '123',
                    website: 'org1.com',
                    contactEmail: 'org1@test.com',
                    contactPhone: '1234567890'
                },
                {
                    name: 'Org 2',
                    category: 'Education',
                    number: '456',
                    website: 'org2.com',
                    contactEmail: 'org2@test.com',
                    contactPhone: '0987654321'
                }
            ];

            const mockBuffer = Buffer.from('mock excel data');
            mockRequest.file = { buffer: mockBuffer } as Express.Multer.File;

            // Mock XLSX functions
            jest.spyOn(XLSX, 'read').mockReturnValue({
                SheetNames: ['Sheet1'],
                Sheets: { Sheet1: {} }
            } as any);
            jest.spyOn(XLSX.utils, 'sheet_to_json').mockReturnValue(mockExcelData);

            (Organization.insertMany as jest.Mock).mockResolvedValue(mockExcelData);

            await createBulkOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseObject).toEqual({
                statusCode: 200,
                data: mockExcelData,
                message: "Organizations are created successfully",
                success: true
            });
        });

        it('should handle missing file', async () => {
            mockRequest.file = undefined;

            await createBulkOrganizations(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toEqual({
                statusCode: 400,
                message: "No file uploaded",
                success: false
            });
        });
    });
}); 