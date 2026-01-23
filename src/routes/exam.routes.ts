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
