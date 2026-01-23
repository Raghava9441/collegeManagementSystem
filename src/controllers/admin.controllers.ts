import { adminDashboardService } from "../services/admin.service";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { UserDocument } from "../@types/express";

/**
 * Get main admin dashboard
 * @route GET /api/v1/dashboard
 */
const getAdminDashBoard = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;
    const { organizationId } = req.user as UserDocument;

    const adminDashboard = await adminDashboardService.getAdminDashboard(
        date as string | undefined,
        organizationId
    );

    if (!adminDashboard) {
        throw new ApiError(404, null, "Admin dashboard not found", undefined, [{ msg: "Admin dashboard is not found" }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, adminDashboard, "Admin dashboard fetched successfully"));
});

/**
 * Get system overview statistics
 * @route GET /api/v1/dashboard/overview
 */
const getSystemOverview = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    const overview = await adminDashboardService.getSystemOverview(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, overview, "System overview fetched successfully"));
});

/**
 * Get user statistics
 * @route GET /api/v1/dashboard/users
 */
const getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    const userStats = await adminDashboardService.getUserStatistics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, userStats, "User statistics fetched successfully"));
});

/**
 * Get attendance analytics
 * @route GET /api/v1/dashboard/attendance
 */
const getAttendanceAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const { organizationId } = req.user as UserDocument;

    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;

    const attendanceAnalytics = await adminDashboardService.getAttendanceAnalytics(
        dateRange,
        organizationId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, attendanceAnalytics, "Attendance analytics fetched successfully"));
});

/**
 * Get exam analytics
 * @route GET /api/v1/dashboard/exams
 */
const getExamAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    const examAnalytics = await adminDashboardService.getExamAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, examAnalytics, "Exam analytics fetched successfully"));
});

/**
 * Get class analytics
 * @route GET /api/v1/dashboard/classes
 */
const getClassAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    const classAnalytics = await adminDashboardService.getClassAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, classAnalytics, "Class analytics fetched successfully"));
});

/**
 * Get course analytics
 * @route GET /api/v1/dashboard/courses
 */
const getCourseAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.user as UserDocument;

    const courseAnalytics = await adminDashboardService.getCourseAnalytics(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, courseAnalytics, "Course analytics fetched successfully"));
});

/**
 * Get recent activities
 * @route GET /api/v1/dashboard/activities
 */
const getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 20 } = req.query;
    const { organizationId } = req.user as UserDocument;

    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 20;

    const activities = await adminDashboardService.getRecentActivities(parsedLimit, organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, activities, "Recent activities fetched successfully"));
});

/**
 * Get organization-specific dashboard
 * @route GET /api/v1/dashboard/organization/:organizationId
 */
const getOrganizationDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.params;

    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }

    const dashboard = await adminDashboardService.getOrganizationDashboard(organizationId);

    return res
        .status(200)
        .json(new ApiResponse(200, dashboard, "Organization dashboard fetched successfully"));
});

/**
 * Get all organizations with stats (Super Admin only)
 * @route GET /api/v1/dashboard/organizations
 */
const getAllOrganizationsWithStats = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const organizations = await adminDashboardService.getAllOrganizationsWithStats({
        page: parsedPage,
        limit: parsedLimit
    });

    return res
        .status(200)
        .json(new ApiResponse(200, organizations, "Organizations fetched successfully"));
});

/**
 * Get system health metrics
 * @route GET /api/v1/dashboard/health
 */
const getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
    const health = await adminDashboardService.getSystemHealth();

    return res
        .status(200)
        .json(new ApiResponse(200, health, "System health fetched successfully"));
});

export {
    getAdminDashBoard,
    getSystemOverview,
    getUserStatistics,
    getAttendanceAnalytics,
    getExamAnalytics,
    getClassAnalytics,
    getCourseAnalytics,
    getRecentActivities,
    getOrganizationDashboard,
    getAllOrganizationsWithStats,
    getSystemHealth,
};
