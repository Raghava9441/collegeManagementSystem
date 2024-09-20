import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';
import multer from 'multer';
import { isAdmin, verifyJWT } from '../middlewares/auth.middleware';

const upload = multer();
const router = Router();
//here i want to add one middle ware to check if user is admin or not

router.route("/")
    .get(
        verifyJWT,
        isAdmin,
        getAllOrganizations
    )
    .post(verifyJWT, isAdmin, createOrganization)

router.route("/:organizationId")
    .get(verifyJWT, isAdmin, getOrganizationById)
    .put(verifyJWT, isAdmin, updateOrganizationById)

router.route("/bulk")
    .post(upload.single('file'), verifyJWT, isAdmin, createBulkOrganizations)
    .delete(verifyJWT, isAdmin, deleteBulkOrganizations)

export default router;