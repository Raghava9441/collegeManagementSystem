import { Router } from 'express';
import { 
    createTeacher, 
    deleteBulkTeachers, 
    deleteTeacherById, 
    getAllTeachers, 
    getTeacherById, 
    updateTeacherById,
    getTeacherDashboard,
    getTeacherAttendanceAnalytics,
    getTeacherStudentPerformance,
    getTeacherCourseAnalytics
} from '../controllers/teacher.controllers';
import { isTeacher, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     description: Retrieve a list of all teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherListResponse'
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
 * /teachers:
 *   post:
 *     summary: Create teacher
 *     tags: [Teachers]
 *     description: Create a new teacher
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
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

router.route("/")
    .get(
        verifyJWT,
        // isTeacher,
        // verifyPermission(["ADMIN", "TEACHER", "ORGANIZATION", "STUDENT", "PARENT"]),
        getAllTeachers
    )
    .post(
        verifyJWT,
        // verifyPermission(["ADMIN", "ORGANIZATION"]),
        createTeacher
    );

/**
 * @swagger
 * /teachers/{teacherId}:
 *   get:
 *     summary: Get teacher by ID
 *     tags: [Teachers]
 *     description: Retrieve a teacher by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Teacher not found
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
 * /teachers/{teacherId}:
 *   put:
 *     summary: Update teacher
 *     tags: [Teachers]
 *     description: Update a teacher by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
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
 *         description: Teacher not found
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
 * /teachers/{teacherId}:
 *   delete:
 *     summary: Delete teacher
 *     tags: [Teachers]
 *     description: Delete a teacher by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
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
 *       404:
 *         description: Teacher not found
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

router.route("/:teacherId")
    .get(verifyJWT, getTeacherById)
    .put(verifyJWT, isTeacher, updateTeacherById)
    .delete(verifyJWT, isTeacher, deleteTeacherById);

/**
 * @swagger
 * /teachers/bulk:
 *   post:
 *     summary: Create bulk teachers
 *     tags: [Teachers]
 *     description: Create multiple teachers in bulk
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teachers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Teacher'
 *     responses:
 *       201:
 *         description: Teachers created successfully
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
 * /teachers/bulk:
 *   delete:
 *     summary: Delete bulk teachers
 *     tags: [Teachers]
 *     description: Delete multiple teachers in bulk
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacherIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Teachers deleted successfully
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

router.route("/bulk")
    .post(verifyJWT, isTeacher, createTeacher)
    .delete(verifyJWT, isTeacher, deleteBulkTeachers);

/**
 * @swagger
 * /teachers/dashboard:
 *   get:
 *     summary: Get teacher dashboard
 *     tags: [Teachers]
 *     description: Retrieve teacher dashboard information
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
router.route("/dashboard")
    .get(verifyJWT, isTeacher, getTeacherDashboard);

/**
 * @swagger
 * /teachers/dashboard/attendance:
 *   get:
 *     summary: Get teacher attendance analytics
 *     tags: [Teachers]
 *     description: Retrieve teacher attendance analytics
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
router.route("/dashboard/attendance")
    .get(verifyJWT, isTeacher, getTeacherAttendanceAnalytics);

/**
 * @swagger
 * /teachers/dashboard/student-performance:
 *   get:
 *     summary: Get teacher student performance
 *     tags: [Teachers]
 *     description: Retrieve teacher student performance data
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
router.route("/dashboard/student-performance")
    .get(verifyJWT, isTeacher, getTeacherStudentPerformance);

/**
 * @swagger
 * /teachers/dashboard/course-analytics:
 *   get:
 *     summary: Get teacher course analytics
 *     tags: [Teachers]
 *     description: Retrieve teacher course analytics
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
router.route("/dashboard/course-analytics")
    .get(verifyJWT, isTeacher, getTeacherCourseAnalytics);

export default router;
