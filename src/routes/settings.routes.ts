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