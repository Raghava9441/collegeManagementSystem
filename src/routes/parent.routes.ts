import { Router } from 'express';
import { createParent, deleteBulkParents, deleteParentById, getAllParents, getParentById, updateParentById } from '../controllers/parent.controllers';
import { isAdmin, isTeacher, verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.route("/")
    .get( getAllParents)
    .post(verifyJWT, isAdmin, isTeacher, createParent);

router.route("/:parentId")
    .get(verifyJWT, isAdmin, isTeacher, getParentById)
    .put(verifyJWT, isAdmin, isTeacher, updateParentById)
    .delete(verifyJWT, isAdmin, isTeacher, deleteParentById);

router.route("/bulk")
    .post(verifyJWT, isAdmin, isTeacher, createParent)
    .delete(verifyJWT, isAdmin, isTeacher, deleteBulkParents);

export default router;