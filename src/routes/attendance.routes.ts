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
 * @swagger
 * /attendances:
 *   get:
 *     summary: Get all attendances
 *     tags: [Attendance]
 *     description: Retrieve a list of all attendances with pagination and filters
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
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID to filter by
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Student ID to filter by
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, excused]
 *         description: Attendance status to filter by
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to filter by (YYYY-MM-DD)
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
 *               $ref: '#/components/schemas/AttendanceListResponse'
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
 * /attendances:
 *   post:
 *     summary: Create a new attendance record
 *     tags: [Attendance]
 *     description: Create a new attendance record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendance'
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/bulk:
 *   post:
 *     summary: Bulk create attendances
 *     tags: [Attendance]
 *     description: Create multiple attendance records in bulk from Excel file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing attendance data
 *     responses:
 *       201:
 *         description: Attendance records created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/bulk:
 *   delete:
 *     summary: Bulk delete attendances
 *     tags: [Attendance]
 *     description: Delete multiple attendance records in bulk
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendanceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of attendance record IDs to delete
 *     responses:
 *       200:
 *         description: Attendance records deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/mark-bulk:
 *   post:
 *     summary: Mark bulk attendance
 *     tags: [Attendance]
 *     description: Mark bulk attendance for a class
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *                 description: Class ID
 *                 required: true
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for the attendance (YYYY-MM-DD)
 *                 required: true
 *               attendanceRecords:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       description: Student ID
 *                     status:
 *                       type: string
 *                       enum: [present, absent, excused]
 *                       description: Attendance status
 *                     remarks:
 *                       type: string
 *                       description: Remarks for attendance
 *                 description: List of attendance records
 *                 required: true
 *               markedBy:
 *                 type: string
 *                 description: ID of the teacher who marked the attendance
 *                 required: true
 *     responses:
 *       201:
 *         description: Bulk attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/student/{studentId}:
 *   get:
 *     summary: Get attendance by student
 *     tags: [Attendance]
 *     description: Retrieve attendance records for a specific student with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Student ID
 *         required: true
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
 *               $ref: '#/components/schemas/AttendanceListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/class/{classId}:
 *   get:
 *     summary: Get attendance by class
 *     tags: [Attendance]
 *     description: Retrieve attendance records for a specific class with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
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
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to filter by (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/date/{date}:
 *   get:
 *     summary: Get attendance by date
 *     tags: [Attendance]
 *     description: Retrieve attendance records for a specific date with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date (YYYY-MM-DD)
 *         required: true
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
 *               $ref: '#/components/schemas/AttendanceListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/stats/student/{studentId}:
 *   get:
 *     summary: Get student attendance statistics
 *     tags: [Attendance]
 *     description: Retrieve attendance statistics for a specific student
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Student ID
 *         required: true
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
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/stats/class/{classId}:
 *   get:
 *     summary: Get class attendance statistics
 *     tags: [Attendance]
 *     description: Retrieve attendance statistics for a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to filter by (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 * /attendances/{attendanceId}:
 *   get:
 *     summary: Get attendance by ID
 *     tags: [Attendance]
 *     description: Retrieve a specific attendance record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendanceId
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *         required: true
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Attendance record not found
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
 * /attendances/{attendanceId}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
 *     description: Update a specific attendance record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendanceId
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Attendance'
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Attendance record not found
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
 * /attendances/{attendanceId}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
 *     description: Delete a specific attendance record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendanceId
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *         required: true
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Attendance record not found
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
