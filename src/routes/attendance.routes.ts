import { Router } from 'express';
import multer from 'multer';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../validators/common/mongodb.validators';
import {
    createAttendanceValidator,
    updateAttendanceValidator,
    attendanceIdValidator,
    studentIdValidator,
    classIdValidator,
    bulkDeleteAttendancesValidator,
    paginationValidator,
    dateQueryValidator,
    dateRangeQueryValidator,
    statusQueryValidator,
    bulkMarkAttendanceValidator,
} from '../validators/attendance.validators';
import {
    getAllAttendances,
    createAttendance,
    getAttendanceById,
    updateAttendanceById,
    deleteAttendanceById,
    deleteBulkAttendances,
    createBulkAttendances,
    getAttendanceByStudent,
    getAttendanceByClass,
    getAttendanceByDate,
    getStudentAttendanceStats,
    getClassAttendanceStats,
    markBulkAttendance,
} from '../controllers/attendance.controllers';

const upload = multer();
const router = Router();

/**
 * @route   GET /api/v1/attendances
 * @desc    Get all attendances with pagination and filters
 * @access  Private
 */
router.route("/")
    .get(
        verifyJWT,
        paginationValidator(),
        dateQueryValidator(),
        dateRangeQueryValidator(),
        statusQueryValidator(),
        handleValidationErrors,
        getAllAttendances
    )
    /**
     * @route   POST /api/v1/attendances
     * @desc    Create a new attendance record
     * @access  Private (ADMIN, TEACHER)
     */
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        createAttendanceValidator(),
        handleValidationErrors,
        createAttendance
    );

/**
 * @route   POST /api/v1/attendances/bulk
 * @desc    Bulk create attendances from Excel file
 * @access  Private (ADMIN)
 */
router.route("/bulk")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        upload.single('file'),
        createBulkAttendances
    )
    /**
     * @route   DELETE /api/v1/attendances/bulk
     * @desc    Bulk delete attendances
     * @access  Private (ADMIN)
     */
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        bulkDeleteAttendancesValidator(),
        handleValidationErrors,
        deleteBulkAttendances
    );

/**
 * @route   POST /api/v1/attendances/mark-bulk
 * @desc    Mark bulk attendance for a class
 * @access  Private (ADMIN, TEACHER)
 */
router.route("/mark-bulk")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        bulkMarkAttendanceValidator(),
        handleValidationErrors,
        markBulkAttendance
    );

/**
 * @route   GET /api/v1/attendances/student/:studentId
 * @desc    Get attendance by student ID
 * @access  Private
 */
router.route("/student/:studentId")
    .get(
        verifyJWT,
        studentIdValidator(),
        paginationValidator(),
        dateRangeQueryValidator(),
        handleValidationErrors,
        getAttendanceByStudent
    );

/**
 * @route   GET /api/v1/attendances/class/:classId
 * @desc    Get attendance by class ID
 * @access  Private
 */
router.route("/class/:classId")
    .get(
        verifyJWT,
        classIdValidator(),
        paginationValidator(),
        dateQueryValidator(),
        handleValidationErrors,
        getAttendanceByClass
    );

/**
 * @route   GET /api/v1/attendances/date/:date
 * @desc    Get attendance by date
 * @access  Private
 */
router.route("/date/:date")
    .get(
        verifyJWT,
        paginationValidator(),
        handleValidationErrors,
        getAttendanceByDate
    );

/**
 * @route   GET /api/v1/attendances/stats/student/:studentId
 * @desc    Get student attendance statistics
 * @access  Private
 */
router.route("/stats/student/:studentId")
    .get(
        verifyJWT,
        studentIdValidator(),
        dateRangeQueryValidator(),
        handleValidationErrors,
        getStudentAttendanceStats
    );

/**
 * @route   GET /api/v1/attendances/stats/class/:classId
 * @desc    Get class attendance statistics
 * @access  Private
 */
router.route("/stats/class/:classId")
    .get(
        verifyJWT,
        classIdValidator(),
        dateQueryValidator(),
        handleValidationErrors,
        getClassAttendanceStats
    );

/**
 * @route   GET /api/v1/attendances/:attendanceId
 * @desc    Get attendance by ID
 * @access  Private
 */
router.route("/:attendanceId")
    .get(
        verifyJWT,
        attendanceIdValidator(),
        handleValidationErrors,
        getAttendanceById
    )
    /**
     * @route   PUT /api/v1/attendances/:attendanceId
     * @desc    Update attendance by ID
     * @access  Private (ADMIN, TEACHER)
     */
    .put(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        attendanceIdValidator(),
        updateAttendanceValidator(),
        handleValidationErrors,
        updateAttendanceById
    )
    /**
     * @route   DELETE /api/v1/attendances/:attendanceId
     * @desc    Delete attendance by ID
     * @access  Private (ADMIN)
     */
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        attendanceIdValidator(),
        handleValidationErrors,
        deleteAttendanceById
    );

export default router;
