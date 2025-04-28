import { Router } from 'express';
import { createTeacher, deleteBulkTeachers, deleteTeacherById, getAllTeachers, getTeacherById, updateTeacherById } from '../controllers/teacher.controllers';
import { isTeacher, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';

const router = Router();

router.route("/")
    .get(
        verifyJWT,
        // isTeacher,
        verifyPermission(["ADMIN", "TEACHER", "ORGANIZATION", "STUDENT", "PARENT"]),
        getAllTeachers
    )
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createTeacher
    );

router.route("/:teacherId")
    .get(verifyJWT, isTeacher, getTeacherById)
    .put(verifyJWT, isTeacher, updateTeacherById)
    .delete(verifyJWT, isTeacher, deleteTeacherById);

router.route("/bulk")
    .post(verifyJWT, isTeacher, createTeacher)
    .delete(verifyJWT, isTeacher, deleteBulkTeachers);

export default router;
