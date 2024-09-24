import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, deleteOrganizationById, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';
import multer from 'multer';
import { isAdmin, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { organizationValidator } from '../validators/organizationValidators';

const upload = multer();
const router = Router();
//here i want to add one middle ware to check if user is admin or not

router.route("/")
    .get(
        // verifyJWT,
        // verifyPermission(["ADMIN"]),
        getAllOrganizations
    )
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createOrganization
    )

router.route("/:organizationId")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getOrganizationById
    )

    .put(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        updateOrganizationById
    )


    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        deleteOrganizationById
    )

router.route("/bulk")
    .post(
        upload.single('file'),
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createBulkOrganizations
    )
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        deleteBulkOrganizations
    )

export default router;