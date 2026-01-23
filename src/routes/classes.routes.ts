import { Router } from 'express';
import multer from 'multer';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../validators/common/mongodb.validators';
import {
    createClassValidator,
    updateClassValidator,
    classIdValidator,
    teacherIdValidator,
    courseIdValidator,
    departmentIdValidator,
    studentIdValidator,
    enrollStudentValidator,
    enrollMultipleStudentsValidator,
    bulkDeleteClassesValidator,
    paginationValidator,
    academicYearQueryValidator,
} from '../validators/classes.validators';
import {
    getAllClasses,
    createClass,
    getClassById,
    updateClassById,
    deleteClassById,
    deleteBulkClasses,
    createBulkClasses,
    enrollStudent,
    removeStudent,
    enrollMultipleStudents,
    getClassesByTeacher,
    getClassesByCourse,
    getClassesByDepartment,
    getStudentsInClass,
    getClassesByAcademicYear,
    getClassStats,
    transferStudent,
} from '../controllers/classes.controllers';

const upload = multer();
const router = Router();

/**
 * @route   GET /api/v1/classes
 * @desc    Get all classes with pagination
 * @access  Private
 */
router.route("/")
    .get(
        verifyJWT,
        paginationValidator(),
        handleValidationErrors,
        getAllClasses
    )
    /**
     * @route   POST /api/v1/classes
     * @desc    Create a new class
     * @access  Private (ADMIN, TEACHER)
     */
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        createClassValidator(),
        handleValidationErrors,
        createClass
    );

/**
 * @route   POST /api/v1/classes/bulk
 * @desc    Bulk create classes from Excel file
 * @access  Private (ADMIN)
 */
router.route("/bulk")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        upload.single('file'),
        createBulkClasses
    )
    /**
     * @route   DELETE /api/v1/classes/bulk
     * @desc    Bulk delete classes
     * @access  Private (ADMIN)
     */
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        bulkDeleteClassesValidator(),
        handleValidationErrors,
        deleteBulkClasses
    );

/**
 * @route   GET /api/v1/classes/academic-year
 * @desc    Get classes by academic year
 * @access  Private
 */
router.route("/academic-year")
    .get(
        verifyJWT,
        academicYearQueryValidator(),
        paginationValidator(),
        handleValidationErrors,
        getClassesByAcademicYear
    );

/**
 * @route   POST /api/v1/classes/transfer-student
 * @desc    Transfer student between classes
 * @access  Private (ADMIN, TEACHER)
 */
router.route("/transfer-student")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        transferStudent
    );

/**
 * @route   GET /api/v1/classes/teacher/:teacherId
 * @desc    Get classes by teacher ID
 * @access  Private
 */
router.route("/teacher/:teacherId")
    .get(
        verifyJWT,
        teacherIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getClassesByTeacher
    );

/**
 * @route   GET /api/v1/classes/course/:courseId
 * @desc    Get classes by course ID
 * @access  Private
 */
router.route("/course/:courseId")
    .get(
        verifyJWT,
        courseIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getClassesByCourse
    );

/**
 * @route   GET /api/v1/classes/department/:departmentId
 * @desc    Get classes by department ID
 * @access  Private
 */
router.route("/department/:departmentId")
    .get(
        verifyJWT,
        departmentIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getClassesByDepartment
    );

/**
 * @route   GET /api/v1/classes/:classId/students
 * @desc    Get students in a class
 * @access  Private
 */
router.route("/:classId/students")
    .get(
        verifyJWT,
        classIdValidator(),
        paginationValidator(),
        handleValidationErrors,
        getStudentsInClass
    );

/**
 * @route   DELETE /api/v1/classes/:classId/students/:studentId
 * @desc    Remove a student from a class
 * @access  Private (ADMIN, TEACHER)
 */
router.route("/:classId/students/:studentId")
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        classIdValidator(),
        studentIdValidator(),
        handleValidationErrors,
        removeStudent
    );

/**
 * @route   POST /api/v1/classes/:classId/enroll
 * @desc    Enroll a student in a class
 * @access  Private (ADMIN, TEACHER)
 */
router.route("/:classId/enroll")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        classIdValidator(),
        enrollStudentValidator(),
        handleValidationErrors,
        enrollStudent
    );

/**
 * @route   POST /api/v1/classes/:classId/enroll-multiple
 * @desc    Enroll multiple students in a class
 * @access  Private (ADMIN, TEACHER)
 */
router.route("/:classId/enroll-multiple")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        classIdValidator(),
        enrollMultipleStudentsValidator(),
        handleValidationErrors,
        enrollMultipleStudents
    );

/**
 * @route   GET /api/v1/classes/:classId/stats
 * @desc    Get class statistics
 * @access  Private
 */
router.route("/:classId/stats")
    .get(
        verifyJWT,
        classIdValidator(),
        handleValidationErrors,
        getClassStats
    );

/**
 * @route   GET /api/v1/classes/:classId
 * @desc    Get class by ID
 * @access  Private
 */
router.route("/:classId")
    .get(
        verifyJWT,
        classIdValidator(),
        handleValidationErrors,
        getClassById
    )
    /**
     * @route   PUT /api/v1/classes/:classId
     * @desc    Update class by ID
     * @access  Private (ADMIN, TEACHER)
     */
    .put(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        classIdValidator(),
        updateClassValidator(),
        handleValidationErrors,
        updateClassById
    )
    /**
     * @route   DELETE /api/v1/classes/:classId
     * @desc    Delete class by ID
     * @access  Private (ADMIN)
     */
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        classIdValidator(),
        handleValidationErrors,
        deleteClassById
    );

export default router;
