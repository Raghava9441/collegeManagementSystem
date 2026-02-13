import { Router } from 'express';
import { 
    createStudent, 
    deleteStudentBulk, 
    deleteStudentById, 
    getAllStudents, 
    getStudentById, 
    updateStudentById,
    getStudentDashboard,
    getStudentAttendanceAnalytics,
    getStudentPerformanceAnalytics
} from '../controllers/student.controllers';
import { checkPermission, isAdmin, isTeacher, isStudent, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';

const router = Router();

router.route("/")
    .get(
        verifyJWT,
        // checkPermission('organizations', 'create'),
        // isTeacher,
        getAllStudents
    )
    .post(createStudent);

router.route("/:studentId")
    .get(verifyJWT, isAdmin, isTeacher, getStudentById)
    .put(verifyJWT, isAdmin, isTeacher, updateStudentById)
    .delete(verifyJWT, isAdmin, isTeacher, deleteStudentById);

router.route("/bulk")
    .post(verifyJWT, isAdmin, isTeacher, createStudent)
    .delete(verifyJWT, isAdmin, isTeacher, deleteStudentBulk);

// Student dashboard routes
router.route("/dashboard")
    .get(verifyJWT, isStudent, getStudentDashboard);

router.route("/dashboard/attendance")
    .get(verifyJWT, isStudent, getStudentAttendanceAnalytics);

router.route("/dashboard/performance")
    .get(verifyJWT, isStudent, getStudentPerformanceAnalytics);

export default router;