import { Router } from 'express';
import { settingsControllers } from '../controllers/settings.controllers';
import { isAdmin, verifyJWT, verifyPermission } from '../middlewares/auth.middleware';
import { 
    systemSettingsValidator, 
    organizationSettingsValidator, 
    userSettingsValidator,
    mongoIdPathVariableValidator 
} from '../validators/settings.validators';

const router = Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get current user settings
 *     tags: [Settings]
 *     description: Get current user settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
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
 * /settings:
 *   put:
 *     summary: Update current user settings
 *     tags: [Settings]
 *     description: Update current user settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /settings/all:
 *   get:
 *     summary: Get all settings for current user
 *     tags: [Settings]
 *     description: Get all settings for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
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
 * /settings/system:
 *   get:
 *     summary: Get system settings
 *     tags: [Settings]
 *     description: Get system settings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
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
 * /settings/system:
 *   put:
 *     summary: Update system settings
 *     tags: [Settings]
 *     description: Update system settings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
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
 *         description: Forbidden
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
 * /settings/organization:
 *   get:
 *     summary: Get organization settings
 *     tags: [Settings]
 *     description: Get organization settings (Org Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
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
 * /settings/organization:
 *   put:
 *     summary: Update organization settings
 *     tags: [Settings]
 *     description: Update organization settings (Org Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
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
 *         description: Forbidden
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

// Routes for all authenticated users (role-specific)
router.route("/")
    .get(
        verifyJWT,
        settingsControllers.getCurrentUserSettings
    )
    .put(
        verifyJWT,
        userSettingsValidator(),
        settingsControllers.updateCurrentUserSettings
    );

// Routes for getting all settings for current user
router.route("/all")
    .get(
        verifyJWT,
        settingsControllers.getAllSettingsForCurrentUser
    );

// System settings routes (Admin only)
router.route("/system")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        settingsControllers.getSystemSettings
    )
    .put(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        systemSettingsValidator(),
        settingsControllers.updateSystemSettings
    );

// Organization settings routes (Org Admin only)
router.route("/organization")
    .get(
        verifyJWT,
        verifyPermission(["ORG_ADMIN"]),
        settingsControllers.getOrganizationSettings
    )
    .put(
        verifyJWT,
        verifyPermission(["ORG_ADMIN"]),
        organizationSettingsValidator(),
        settingsControllers.updateOrganizationSettings
    );

// Default settings routes (Admin only)
router.route("/default/:role")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        settingsControllers.getDefaultSettings
    );

// Settings management routes (Admin only)
router.route("/delete/:type/:role")
    .delete(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        settingsControllers.deleteSettings
    );

router.route("/reset/:type/:role")
    .post(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        settingsControllers.resetSettingsToDefault
    );

// System-wide settings for all roles (Admin only)
router.route("/system/all")
    .get(
        verifyJWT,
        verifyPermission(["ADMIN"]),
        settingsControllers.getSystemSettingsForAllRoles
    );

export default router;