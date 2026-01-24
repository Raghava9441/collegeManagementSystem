import { Router } from 'express';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../validators/common/mongodb.validators';
import { query } from 'express-validator';
import {
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
} from '../controllers/orgAdmin.controllers';

const router = Router();

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

// User filter validators
const userFilterValidator = () => [
    query("role")
        .optional()
        .isIn(["ADMIN", "TEACHER", "STUDENT", "PARENT", "ORG_ADMIN"])
        .withMessage("Invalid role"),
    query("isActive")
        .optional()
        .isIn(["true", "false"])
        .withMessage("isActive must be true or false"),
    query("search")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Search term must be between 1 and 100 characters"),
];

/**
 * @route   GET /api/v1/org-admin/dashboard
 * @desc    Get organization dashboard overview
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/dashboard")
    .get(
        verifyJWT,
        verifyPermission(["ORGADMIN", "ADMIN"]),
        getOrgDashboard
    );

/**
 * @route   GET /api/v1/org-admin/users
 * @desc    Get organization users with filters and pagination
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/users")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        paginationValidator(),
        userFilterValidator(),
        handleValidationErrors,
        getOrgUsers
    );

/**
 * @route   GET /api/v1/org-admin/analytics/students
 * @desc    Get organization student analytics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/students")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgStudentAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/analytics/teachers
 * @desc    Get organization teacher analytics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/teachers")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgTeacherAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/analytics/attendance
 * @desc    Get organization attendance analytics with date range
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/attendance")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        dateRangeValidator(),
        handleValidationErrors,
        getOrgAttendanceAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/analytics/classes
 * @desc    Get organization class analytics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/classes")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgClassAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/analytics/exams
 * @desc    Get organization exam analytics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/exams")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgExamAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/analytics/courses
 * @desc    Get organization course analytics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/courses")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgCourseAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/analytics/departments
 * @desc    Get organization department analytics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/analytics/departments")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgDepartmentAnalytics
    );

/**
 * @route   GET /api/v1/org-admin/activities
 * @desc    Get organization recent activities
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/activities")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage("Limit must be between 1 and 50"),
        handleValidationErrors,
        getOrgRecentActivities
    );

/**
 * @route   GET /api/v1/org-admin/performance
 * @desc    Get organization performance metrics
 * @access  Private (ORG_ADMIN, ADMIN)
 */
router.route("/performance")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN", "ADMIN"]),
        getOrgPerformanceMetrics
    );

export default router;
