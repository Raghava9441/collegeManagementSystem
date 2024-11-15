import { Router } from 'express';
import { createBulkClasses, createClass, deleteBulkClasses, deleteClassById, getAllClasses, getClassById, updateClassById } from '../controllers/classes.controllers';
import { verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';

const router = Router();

router.route("/")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        getAllClasses
    )
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        createClass
    );

router.route("/:classId")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        mongoIdPathVariableValidator,
        getClassById
    )
    .put(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        mongoIdPathVariableValidator,
        updateClassById
    )
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        mongoIdPathVariableValidator,
        deleteClassById
    );

router.route("/bulk")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        createBulkClasses
    )
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN", "TEACHER"]),
        deleteBulkClasses
    );

export default router;