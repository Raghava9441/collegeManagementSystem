import { Router } from 'express';
import { createBulkCourses, createCourse, deleteBulkCourses, deleteCourseById, getAllCourses, getCourseById, updateCourseById } from '../controllers/courses.controllers';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { courseValidator } from '../validators/course.validators';
import { handleValidationErrors } from '../validators/common/mongodb.validators';

const router = Router();

router.route("/")
    .get(
        verifyJWT,
        getAllCourses
    )
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        courseValidator(),
        handleValidationErrors,
        createCourse
    );

router.route("/:courseId")
    .get(getCourseById)
    .put(updateCourseById)
    .delete(deleteCourseById);

router.route("/bulk")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createBulkCourses
    )
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        deleteBulkCourses
    );

export default router;