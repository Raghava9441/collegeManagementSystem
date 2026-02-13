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

router.route("/:teacherId")
    .get(verifyJWT, getTeacherById)
    .put(verifyJWT, isTeacher, updateTeacherById)
    .delete(verifyJWT, isTeacher, deleteTeacherById);

router.route("/bulk")
    .post(verifyJWT, isTeacher, createTeacher)
    .delete(verifyJWT, isTeacher, deleteBulkTeachers);

// Teacher Dashboard Routes
router.route("/dashboard")
    .get(verifyJWT, isTeacher, getTeacherDashboard);

router.route("/dashboard/attendance")
    .get(verifyJWT, isTeacher, getTeacherAttendanceAnalytics);

router.route("/dashboard/student-performance")
    .get(verifyJWT, isTeacher, getTeacherStudentPerformance);

router.route("/dashboard/course-analytics")
    .get(verifyJWT, isTeacher, getTeacherCourseAnalytics);

export default router;
