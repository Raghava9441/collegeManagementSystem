import { Router } from 'express';
import { createBulkCourses, createCourse, deleteBulkCourses, deleteCourseById, getAllCourses, getCourseById, updateCourseById } from '../controllers/courses.controllers';

const router = Router();

router.route("/")
    .get(getAllCourses)
    .post(createCourse);

router.route("/:courseId")
    .get(getCourseById)
    .put(updateCourseById)
    .delete(deleteCourseById);

router.route("/bulk")
    .post(createBulkCourses)
    .delete(deleteBulkCourses);

export default router;