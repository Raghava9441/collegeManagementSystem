import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, deleteOrganizationById, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';
import multer from 'multer';
import { isAdmin, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { organizationValidator } from '../validators/organization.validators';
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';

const upload = multer();
const router = Router();

router.route("/")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getAllOrganizations
    )
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        organizationValidator(),
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
        organizationValidator(),
        updateOrganizationById
    )


    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        mongoIdPathVariableValidator("organizationId"),
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