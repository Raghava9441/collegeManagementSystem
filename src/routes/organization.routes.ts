import { Router } from 'express';
import { createBulkOrganizations, createOrganization, deleteBulkOrganizations, deleteOrganizationById, getAllOrganizations, getOrganizationById, updateOrganizationById } from '../controllers/organization.controllers';
import multer from 'multer';
import { isAdmin, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { organizationValidator } from '../validators/organization.validators';
import { mongoIdPathVariableValidator } from '../validators/common/mongodb.validators';
// import { apiRateLimiter } from 'middlewares/rateLimiter.middleware';

const upload = multer();
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Organization ID
 *         name:
 *           type: string
 *           description: Organization name
 *         email:
 *           type: string
 *           format: email
 *           description: Organization email
 *         phone:
 *           type: string
 *           description: Organization phone number
 *         address:
 *           type: string
 *           description: Organization address
 *         city:
 *           type: string
 *           description: Organization city
 *         state:
 *           type: string
 *           description: Organization state
 *         country:
 *           type: string
 *           description: Organization country
 *         zipCode:
 *           type: string
 *           description: Organization zip code
 *         logo:
 *           type: string
 *           format: uri
 *           description: Organization logo URL
 *         isActive:
 *           type: boolean
 *           description: Organization active status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Organization creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Organization last update date
 *       example:
 *         _id: "60d0fe4f5311236168a109ca"
 *         name: "Example College"
 *         email: "info@examplecollege.edu"
 *         phone: "+1234567890"
 *         address: "123 College Street"
 *         city: "Example City"
 *         state: "Example State"
 *         country: "Example Country"
 *         zipCode: "12345"
 *         logo: "https://example.com/logo.png"
 *         isActive: true
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 *     CreateOrganizationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Organization name
 *         email:
 *           type: string
 *           format: email
 *           description: Organization email
 *         phone:
 *           type: string
 *           description: Organization phone number
 *         address:
 *           type: string
 *           description: Organization address
 *         city:
 *           type: string
 *           description: Organization city
 *         state:
 *           type: string
 *           description: Organization state
 *         country:
 *           type: string
 *           description: Organization country
 *         zipCode:
 *           type: string
 *           description: Organization zip code
 *         logo:
 *           type: string
 *           format: binary
 *           description: Organization logo image
 *       required: ["name", "email", "phone", "address", "city", "state", "country", "zipCode"]
 *       example:
 *         name: "Example College"
 *         email: "info@examplecollege.edu"
 *         phone: "+1234567890"
 *         address: "123 College Street"
 *         city: "Example City"
 *         state: "Example State"
 *         country: "Example Country"
 *         zipCode: "12345"
 *     OrganizationListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             organizations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 *             total:
 *               type: number
 *             page:
 *               type: number
 *             limit:
 *               type: number
 */

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     description: Retrieve a list of all organizations (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /organizations:
 *   post:
 *     summary: Create new organization
 *     tags: [Organizations]
 *     description: Create a new organization (requires ADMIN role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrganizationRequest'
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/")
    .get(
        // apiRateLimiter,
        verifyJWT,
        // verifyPermission(["ADMIN"]),
        getAllOrganizations
    )
    .post(
        // apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        organizationValidator(),
        createOrganization
    )

/**
 * @swagger
 * /organizations/{organizationId}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     description: Retrieve an organization by its ID (requires ADMIN role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: MongoDB organization ID
 *     responses:
 *       200:
 *         description: Organization retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /organizations/{organizationId}:
 *   put:
 *     summary: Update organization
 *     tags: [Organizations]
 *     description: Update an organization's information (requires ADMIN role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: MongoDB organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrganizationRequest'
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /organizations/{organizationId}:
 *   delete:
 *     summary: Delete organization
 *     tags: [Organizations]
 *     description: Delete an organization by its ID (requires ADMIN role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *           format: mongoId
 *         description: MongoDB organization ID
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/:organizationId")
    .get(
        // apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN","ORGADMIN"]),
        getOrganizationById
    )
    .put(
        // apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        organizationValidator(),
        updateOrganizationById
    )
    .delete(
        // apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        mongoIdPathVariableValidator("organizationId"),
        deleteOrganizationById
    )

/**
 * @swagger
 * /organizations/bulk:
 *   post:
 *     summary: Create bulk organizations
 *     tags: [Organizations]
 *     description: Create multiple organizations in bulk (requires ADMIN role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel/CSV file containing organization data
 *     responses:
 *       201:
 *         description: Organizations created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /organizations/bulk:
 *   delete:
 *     summary: Delete bulk organizations
 *     tags: [Organizations]
 *     description: Delete multiple organizations in bulk (requires ADMIN role)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: mongoId
 *     responses:
 *       200:
 *         description: Organizations deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - ADMIN role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/bulk")
    .post(
        // apiRateLimiter,
        upload.single('file'),
        verifyJWT,
        verifyPermission(["ADMIN"]),
        createBulkOrganizations
    )
    .delete(
        // apiRateLimiter,
        verifyJWT,
        verifyPermission(["ADMIN"]),
        deleteBulkOrganizations
    )

export default router;