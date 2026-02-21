import { Router } from 'express';
import multer from 'multer';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../validators/common/mongodb.validators';
import {
    createExamValidator,
    updateExamValidator,
    examIdValidator,
    classIdValidator,
    teacherIdValidator,
    courseIdValidator,
    examTypeQueryValidator,
    bulkDeleteExamsValidator,
    paginationValidator,
} from '../validators/exam.validators';
import {
    getAllExams,
    createExam,
    getExamById,
    updateExam,
    deleteExam,
    createBulkExams,
    deleteBulkExams,
    getExamsByClass,
    getExamsByTeacher,
    getExamsByCourse,
    getUpcomingExams,
    getExamsByType,
} from '../controllers/exam.controllers';

const upload = multer();
const router = Router();

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     description: Retrieve a list of all exams with pagination
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
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     description: Create a new exam
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
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
 * /exams/bulk:
 *   post:
 *     summary: Bulk create exams
 *     tags: [Exams]
 *     description: Create multiple exams in bulk from Excel file
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
 *                 description: Excel file containing exam data
 *     responses:
 *       201:
 *         description: Exams created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams/bulk:
 *   delete:
 *     summary: Bulk delete exams
 *     tags: [Exams]
 *     description: Delete multiple exams in bulk
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               examIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of exam IDs to delete
 *     responses:
 *       200:
 *         description: Exams deleted successfully
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
 * /exams/upcoming:
 *   get:
 *     summary: Get upcoming exams
 *     tags: [Exams]
 *     description: Retrieve upcoming exams with pagination
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
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams/type:
 *   get:
 *     summary: Get exams by type
 *     tags: [Exams]
 *     description: Retrieve exams by type (quiz, midterm, final) with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [quiz, midterm, final]
 *         description: Exam type (quiz, midterm, final)
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
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams/class/{classId}:
 *   get:
 *     summary: Get exams by class
 *     tags: [Exams]
 *     description: Retrieve exams for a specific class with pagination
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
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams/teacher/{teacherId}:
 *   get:
 *     summary: Get exams by teacher
 *     tags: [Exams]
 *     description: Retrieve exams taught by a specific teacher with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Teacher ID
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
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams/course/{courseId}:
 *   get:
 *     summary: Get exams by course
 *     tags: [Exams]
 *     description: Retrieve exams for a specific course with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Course ID
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
 *               $ref: '#/components/schemas/ExamListResponse'
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
 * /exams/{examId}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Exams]
 *     description: Retrieve a specific exam by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         schema:
 *           type: string
 *         description: Exam ID
 *         required: true
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
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
 *         description: Exam not found
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
 * /exams/{examId}:
 *   put:
 *     summary: Update exam
 *     tags: [Exams]
 *     description: Update a specific exam by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         schema:
 *           type: string
 *         description: Exam ID
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
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
 *         description: Exam not found
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
 * /exams/{examId}:
 *   delete:
 *     summary: Delete exam
 *     tags: [Exams]
 *     description: Delete a specific exam by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         schema:
 *           type: string
 *         description: Exam ID
 *         required: true
 *     responses:
 *       200:
 *         description: Exam deleted successfully
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
 *         description: Exam not found
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
 * @route   GET /api/v1/exams
 * @desc    Get all exams with pagination
 * @access  Private
 */
router.route("/")
    .get(
        verifyJWT,
        paginationValidator(),
        handleValidationErrors,
        getAllExams
    )
    /**
     * @route   POST /api/v1/exams
     * @desc    Create a new exam
     * @access  Private (ADMIN, TEACHER)
     */
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        createExamValidator(),
        handleValidationErrors,
        createExam
    );

/**
 * @route   POST /api/v1/exams/bulk
 * @desc    Bulk create exams from Excel file
 * @access  Private (ADMIN)
 */
router.route("/bulk")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        upload.single('file'),
        createBulkExams
    )
    /**
     * @route   DELETE /api/v1/exams/bulk
     * @desc    Bulk delete exams
     * @access  Private (ADMIN)
     */
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        bulkDeleteExamsValidator(),
        handleValidationErrors,
        deleteBulkExams
    );

/**
 * @route   GET /api/v1/exams/upcoming
 * @desc    Get upcoming exams
 * @access  Private
 */
router.route("/upcoming")
    .get(
        verifyJWT,
        paginationValidator(),
        handleValidationErrors,
        getUpcomingExams
    );

/**
 * @route   GET /api/v1/exams/type
 * @desc    Get exams by type (quiz, midterm, final)
 * @access  Private
 */
router.route("/type")
    .get(
        verifyJWT,
        examTypeQueryValidator(),
        paginationValidator(),
        handleValidationErrors,
        getExamsByType
    );

/**
 * @route   GET /api/v1/exams/class/:classId
 * @desc    Get exams by class ID
 * @access  Private
 */
router.route("/class/:classId")
    .get(
        verifyJWT,
        classIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getExamsByClass
    );

/**
 * @route   GET /api/v1/exams/teacher/:teacherId
 * @desc    Get exams by teacher ID
 * @access  Private
 */
router.route("/teacher/:teacherId")
    .get(
        verifyJWT,
        teacherIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getExamsByTeacher
    );

/**
 * @route   GET /api/v1/exams/course/:courseId
 * @desc    Get exams by course ID
 * @access  Private
 */
router.route("/course/:courseId")
    .get(
        verifyJWT,
        courseIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getExamsByCourse
    );

/**
 * @route   GET /api/v1/exams/:examId
 * @desc    Get exam by ID
 * @access  Private
 */
router.route("/:examId")
    .get(
        verifyJWT,
        examIdValidator(),
        handleValidationErrors,
        getExamById
    )
    /**
     * @route   PUT /api/v1/exams/:examId
     * @desc    Update exam by ID
     * @access  Private (ADMIN, TEACHER)
     */
    .put(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        examIdValidator(),
        updateExamValidator(),
        handleValidationErrors,
        updateExam
    )
    /**
     * @route   DELETE /api/v1/exams/:examId
     * @desc    Delete exam by ID
     * @access  Private (ADMIN)
     */
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        examIdValidator(),
        handleValidationErrors,
        deleteExam
    );

export default router;
