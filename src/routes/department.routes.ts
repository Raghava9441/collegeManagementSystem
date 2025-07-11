import { Router } from 'express';
import { createBulkDepartments, createDepartment, deleteBulkDepartments, deleteDepartmentById, getAllDepartments, getDepartmentById, updateDepartmentById } from '../controllers/department.controllers';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route("/")
    .get(verifyJWT, getAllDepartments)
    .post(verifyJWT, createDepartment);

router.route("/:departmentId")
    .get(verifyJWT, getDepartmentById)
    .put(verifyJWT, updateDepartmentById)
    .delete(verifyJWT, deleteDepartmentById);

router.route("/bulk")
    .post(verifyJWT, createBulkDepartments)
    .delete(verifyJWT, deleteBulkDepartments);

export default router;