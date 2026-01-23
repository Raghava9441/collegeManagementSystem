import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { orgAdminService } from "../services/orgAdmin.service";
import { UserDocument } from "../@types/express";

/**
 * Get organization dashboard overview
 * @route GET /api/v1/org-admin/dashboard
 */
const getOrgDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const dashboard = await orgAdminService.getOrgDashboard(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, dashboard, "Organization dashboard fetched successfully"));
});

/**
 * Get organization users with filters
 * @route GET /api/v1/org-admin/users
 */
const getOrgUsers = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;
    const { page = 1, limit = 10, role, isActive, search } = req.query;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const filters = {
        role: role as string | undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search: search as string | undefined
    };

    const users = await orgAdminService.getOrgUsers(
        organizationId,
        { page: parsedPage, limit: parsedLimit },
        filters
    );

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Organization users fetched successfully"));
});

/**
 * Get organization student analytics
 * @route GET /api/v1/org-admin/analytics/students
 */
const getOrgStudentAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const analytics = await orgAdminService.getOrgStudentAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Student analytics fetched successfully"));
});

/**
 * Get organization teacher analytics
 * @route GET /api/v1/org-admin/analytics/teachers
 */
const getOrgTeacherAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const analytics = await orgAdminService.getOrgTeacherAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Teacher analytics fetched successfully"));
});

/**
 * Get organization attendance analytics
 * @route GET /api/v1/org-admin/analytics/attendance
 */
const getOrgAttendanceAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;
    const { startDate, endDate } = req.query;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;

    const analytics = await orgAdminService.getOrgAttendanceAnalytics(organizationId, dateRange);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Attendance analytics fetched successfully"));
});

/**
 * Get organization class analytics
 * @route GET /api/v1/org-admin/analytics/classes
 */
const getOrgClassAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const analytics = await orgAdminService.getOrgClassAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Class analytics fetched successfully"));
});

/**
 * Get organization exam analytics
 * @route GET /api/v1/org-admin/analytics/exams
 */
const getOrgExamAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const analytics = await orgAdminService.getOrgExamAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Exam analytics fetched successfully"));
});

/**
 * Get organization course analytics
 * @route GET /api/v1/org-admin/analytics/courses
 */
const getOrgCourseAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const analytics = await orgAdminService.getOrgCourseAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Course analytics fetched successfully"));
});

/**
 * Get organization department analytics
 * @route GET /api/v1/org-admin/analytics/departments
 */
const getOrgDepartmentAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const analytics = await orgAdminService.getOrgDepartmentAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, analytics, "Department analytics fetched successfully"));
});

/**
 * Get organization recent activities
 * @route GET /api/v1/org-admin/activities
 */
const getOrgRecentActivities = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;
    const { limit = 20 } = req.query;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 20;

    const activities = await orgAdminService.getOrgRecentActivities(organizationId, parsedLimit);

    return res
        .status(200)
        .json(new ApiResponse(200, activities, "Recent activities fetched successfully"));
});

/**
 * Get organization performance metrics
 * @route GET /api/v1/org-admin/performance
 */
const getOrgPerformanceMetrics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const metrics = await orgAdminService.getOrgPerformanceMetrics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, metrics, "Performance metrics fetched successfully"));
});

export {
    getOrgDashboard,
    getOrgUsers,
    getOrgStudentAnalytics,
    getOrgTeacherAnalytics,
    getOrgAttendanceAnalytics,
    getOrgClassAnalytics,
    getOrgExamAnalytics,
    getOrgCourseAnalytics,
    getOrgDepartmentAnalytics,
    getOrgRecentActivities,
    getOrgPerformanceMetrics,
};
