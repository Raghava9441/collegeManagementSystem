import { Router } from 'express';
import { verifyJWT, verifyPermission, isAdmin } from '../middlewares/auth.middleware';
import { handleValidationErrors, mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';
import { query } from 'express-validator';
import {
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
} from '../controllers/admin.controllers';

const router = Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Dashboard]
 *     description: Retrieve admin dashboard with overview
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for the dashboard (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: Get system overview
 *     tags: [Dashboard]
 *     description: Retrieve comprehensive system overview statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/users:
 *   get:
 *     summary: Get user statistics
 *     tags: [Dashboard]
 *     description: Retrieve user statistics by role and status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/attendance:
 *   get:
 *     summary: Get attendance analytics
 *     tags: [Dashboard]
 *     description: Retrieve attendance analytics with trends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of date range filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of date range filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/exams:
 *   get:
 *     summary: Get exam analytics
 *     tags: [Dashboard]
 *     description: Retrieve exam analytics and statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/classes:
 *   get:
 *     summary: Get class analytics
 *     tags: [Dashboard]
 *     description: Retrieve class analytics with capacity utilization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/courses:
 *   get:
 *     summary: Get course analytics
 *     tags: [Dashboard]
 *     description: Retrieve course analytics and popular courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Dashboard]
 *     description: Retrieve recent activities across the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of activities to return (1-50)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/organizations:
 *   get:
 *     summary: Get all organizations with stats
 *     tags: [Dashboard]
 *     description: Retrieve all organizations with statistics (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/organization/{organizationId}:
 *   get:
 *     summary: Get specific organization dashboard
 *     tags: [Dashboard]
 *     description: Retrieve specific organization dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Organization ID
 *         required: true
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard/health:
 *   get:
 *     summary: Get system health metrics
 *     tags: [Dashboard]
 *     description: Retrieve system health metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Pagination validator
const paginationValidator = () => [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
];

// Date range validator
const dateRangeValidator = () => [
    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date"),
    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date"),
];

/**
 * @route   GET /api/v1/dashboard
 * @desc    Get main admin dashboard with overview
 * @access  Private (ADMIN)
 */
router.route("/")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getAdminDashBoard
    );

/**
 * @route   GET /api/v1/dashboard/overview
 * @desc    Get comprehensive system overview statistics
 * @access  Private (ADMIN)
 */
router.route("/overview")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getSystemOverview
    );

/**
 * @route   GET /api/v1/dashboard/users
 * @desc    Get user statistics by role and status
 * @access  Private (ADMIN)
 */
router.route("/users")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getUserStatistics
    );

/**
 * @route   GET /api/v1/dashboard/attendance
 * @desc    Get attendance analytics with trends
 * @access  Private (ADMIN)
 */
router.route("/attendance")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        dateRangeValidator(),
        handleValidationErrors,
        getAttendanceAnalytics
    );

/**
 * @route   GET /api/v1/dashboard/exams
 * @desc    Get exam analytics and statistics
 * @access  Private (ADMIN)
 */
router.route("/exams")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getExamAnalytics
    );

/**
 * @route   GET /api/v1/dashboard/classes
 * @desc    Get class analytics with capacity utilization
 * @access  Private (ADMIN)
 */
router.route("/classes")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getClassAnalytics
    );

/**
 * @route   GET /api/v1/dashboard/courses
 * @desc    Get course analytics and popular courses
 * @access  Private (ADMIN)
 */
router.route("/courses")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getCourseAnalytics
    );

/**
 * @route   GET /api/v1/dashboard/activities
 * @desc    Get recent activities across the system
 * @access  Private (ADMIN)
 */
router.route("/activities")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage("Limit must be between 1 and 50"),
        handleValidationErrors,
        getRecentActivities
    );

/**
 * @route   GET /api/v1/dashboard/organizations
 * @desc    Get all organizations with statistics (Super Admin)
 * @access  Private (ADMIN)
 */
router.route("/organizations")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        paginationValidator(),
        handleValidationErrors,
        getAllOrganizationsWithStats
    );

/**
 * @route   GET /api/v1/dashboard/organization/:organizationId
 * @desc    Get specific organization dashboard
 * @access  Private (ADMIN)
 */
router.route("/organization/:organizationId")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        mongoIdPathVariableValidator("organizationId"),
        handleValidationErrors,
        getOrganizationDashboard
    );

/**
 * @route   GET /api/v1/dashboard/health
 * @desc    Get system health metrics
 * @access  Private (ADMIN)
 */
router.route("/health")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getSystemHealth
    );

export default router;
