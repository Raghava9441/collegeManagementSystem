import { Router } from 'express';
import { createTeacher, deleteBulkTeachers, deleteTeacherById, getAllTeachers, getTeacherById, updateTeacherById } from '../controllers/teacher.controllers';

const router = Router();

router.route("/")
    .get(getAllTeachers)
    .post(createTeacher);

router.route("/:teacherId")
    .get(getTeacherById)
    .put(updateTeacherById)
    .delete(deleteTeacherById);

router.route("/bulk")
    .post(createTeacher)
    .delete(deleteBulkTeachers);

export default router;
