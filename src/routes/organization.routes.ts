import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, deleteOrganizationById, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';
import multer from 'multer';
import { isAdmin, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { organizationValidator } from '../validators/organization.validators';
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';
import { apiRateLimiter } from 'middlewares/rateLimiter.middleware';

const upload = multer();
const router = Router();

router.route("/")
    .get(
        apiRateLimiter,
        // verifyJWT,
        // verifyPermission(["ADMIN"]),
        getAllOrganizations
    )
    .post(
        apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        organizationValidator(),
        createOrganization
    )

router.route("/:organizationId")
    .get(
        apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        getOrganizationById
    )
    .put(
        apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        organizationValidator(),
        updateOrganizationById
    )
    .delete(
        apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        mongoIdPathVariableValidator("organizationId"),
        deleteOrganizationById
    )

router.route("/bulk")
    .post(
        apiRateLimiter,
        upload.single('file'),
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createBulkOrganizations
    )
    .delete(
        apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        deleteBulkOrganizations
    )

export default router;