import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';

const router = Router();

router.route("/")
    .get(getAllOrganizations)
    .post(createOrganization)

router.route("/:organizationId")
    .get(getOrganizationById)
    .put(updateOrganizationById)

router.route("/bulk")
    .post(createBulkOrganizations)
    .delete(deleteBulkOrganizations)

export default router;