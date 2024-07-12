import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';
import multer from 'multer';

const upload = multer();
const router = Router();

router.route("/")
    .get(getAllOrganizations)
    .post(createOrganization)

router.route("/:organizationId")
    .get(getOrganizationById)
    .put(updateOrganizationById)

router.route("/bulk")
    .post(upload.single('file'), createBulkOrganizations)
    .delete(deleteBulkOrganizations)

export default router;