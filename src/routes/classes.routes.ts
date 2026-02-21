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
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     description: Retrieve a list of all classes with pagination
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
 *               $ref: '#/components/schemas/ClassListResponse'
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
 * /classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     description: Create a new class
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
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
 * /classes/bulk:
 *   post:
 *     summary: Bulk create classes
 *     tags: [Classes]
 *     description: Create multiple classes in bulk from Excel file
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
 *                 description: Excel file containing class data
 *     responses:
 *       201:
 *         description: Classes created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassListResponse'
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
 * /classes/bulk:
 *   delete:
 *     summary: Bulk delete classes
 *     tags: [Classes]
 *     description: Delete multiple classes in bulk
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of class IDs to delete
 *     responses:
 *       200:
 *         description: Classes deleted successfully
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
 * /classes/academic-year:
 *   get:
 *     summary: Get classes by academic year
 *     tags: [Classes]
 *     description: Retrieve classes by academic year with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Academic year (e.g., 2023-2024)
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
 *               $ref: '#/components/schemas/ClassListResponse'
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
 * /classes/transfer-student:
 *   post:
 *     summary: Transfer student between classes
 *     tags: [Classes]
 *     description: Transfer a student from one class to another
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               fromClassId:
 *                 type: string
 *                 description: Source class ID
 *               toClassId:
 *                 type: string
 *                 description: Destination class ID
 *             required: [studentId, fromClassId, toClassId]
 *     responses:
 *       200:
 *         description: Student transferred successfully
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
 * /classes/teacher/{teacherId}:
 *   get:
 *     summary: Get classes by teacher
 *     tags: [Classes]
 *     description: Retrieve classes taught by a specific teacher with pagination
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
 *               $ref: '#/components/schemas/ClassListResponse'
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
 * /classes/course/{courseId}:
 *   get:
 *     summary: Get classes by course
 *     tags: [Classes]
 *     description: Retrieve classes for a specific course with pagination
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
 *               $ref: '#/components/schemas/ClassListResponse'
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
 * /classes/department/{departmentId}:
 *   get:
 *     summary: Get classes by department
 *     tags: [Classes]
 *     description: Retrieve classes in a specific department with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Department ID
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
 *               $ref: '#/components/schemas/ClassListResponse'
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
 * /classes/{classId}/students:
 *   get:
 *     summary: Get students in class
 *     tags: [Classes]
 *     description: Retrieve students enrolled in a specific class with pagination
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
 *               $ref: '#/components/schemas/StudentListResponse'
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
 * /classes/{classId}/students/{studentId}:
 *   delete:
 *     summary: Remove student from class
 *     tags: [Classes]
 *     description: Remove a student from a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Student ID
 *         required: true
 *     responses:
 *       200:
 *         description: Student removed successfully
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
 * /classes/{classId}/enroll:
 *   post:
 *     summary: Enroll student in class
 *     tags: [Classes]
 *     description: Enroll a student in a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *             required: [studentId]
 *     responses:
 *       200:
 *         description: Student enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
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
 * /classes/{classId}/enroll-multiple:
 *   post:
 *     summary: Enroll multiple students in class
 *     tags: [Classes]
 *     description: Enroll multiple students in a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of student IDs to enroll
 *             required: [studentIds]
 *     responses:
 *       200:
 *         description: Students enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
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
 * /classes/{classId}/stats:
 *   get:
 *     summary: Get class statistics
 *     tags: [Classes]
 *     description: Retrieve statistics for a specific class
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
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
 * /classes/{classId}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
 *     description: Retrieve a specific class by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
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
 *         description: Class not found
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
 * /classes/{classId}:
 *   put:
 *     summary: Update class
 *     tags: [Classes]
 *     description: Update a specific class by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
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
 *         description: Class not found
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
 * /classes/{classId}:
 *   delete:
 *     summary: Delete class
 *     tags: [Classes]
 *     description: Delete a specific class by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: string
 *         description: Class ID
 *         required: true
 *     responses:
 *       200:
 *         description: Class deleted successfully
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
 *         description: Class not found
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
