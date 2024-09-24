import { Router } from 'express';
import { createBulkDepartments, createDepartment, deleteBulkDepartments, deleteDepartmentById, getAllDepartments, getDepartmentById, updateDepartmentById } from '../controllers/department.controllers';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route("/")
    .get(verifyJWT, isAdmin, getAllDepartments)
    .post(verifyJWT, isAdmin, createDepartment);

router.route("/:departmentId")
    .get(verifyJWT, isAdmin, getDepartmentById)
    .put(verifyJWT, isAdmin, updateDepartmentById)
    .delete(verifyJWT, isAdmin, deleteDepartmentById);

router.route("/bulk")
    .post(verifyJWT, isAdmin, createBulkDepartments)
    .delete(verifyJWT, isAdmin, deleteBulkDepartments);

export default router;