import { Router } from 'express';
import { createStudent, deleteStudentBulk, deleteStudentById, getAllStudents, getStudentById, updateStudentById } from '../controllers/student.controllers';
import { isAdmin, isTeacher, verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route("/")
    .get(
        verifyJWT,
        // isAdmin,
        isTeacher,
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

export default router;