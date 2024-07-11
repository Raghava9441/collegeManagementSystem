import { Router } from 'express';
import { createStudent, deleteStudentBulk, deleteStudentById, getAllStudents, getStudentById, updateStudentById } from '../controllers/student.controllers';

const router = Router();

router.route("/")
    .get(getAllStudents)
    .post(createStudent);

router.route("/:studentId")
    .get(getStudentById)
    .put(updateStudentById)
    .delete(deleteStudentById);

router.route("/bulk")
    .post(createStudent)
    .delete(deleteStudentBulk);

export default router;