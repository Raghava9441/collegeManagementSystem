import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

class SettingsControllers {

    /**
     * Get settings for current user based on their role
     */
    getCurrentUserSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;
        
        const settings = await settingsService.getOrCreateSettings(
            user._id,
            'USER',
            user.role
        );

        // Extract role-specific settings directly from the document
        let roleSpecificSettings;
        const typedSettings = settings as any;
        if (user.role === 'ADMIN') {
            roleSpecificSettings = { systemSettings: typedSettings.systemSettings };
        } else if (user.role === 'ORG_ADMIN') {
            roleSpecificSettings = { organizationSettings: typedSettings.organizationSettings };
        } else {
            roleSpecificSettings = { userSettings: typedSettings.userSettings };
        }

        res.status(200).json(
            new ApiResponse(200, roleSpecificSettings, 'Settings fetched successfully')
        );
    });

    /**
     * Update current user's settings based on their role
     */
    updateCurrentUserSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;
        const updates = req.body;

        const settings = await settingsService.updateSettingsByRole(
            user._id,
            user.role,
            updates
        );

        // Extract role-specific settings directly from the document
        let roleSpecificSettings;
        const typedSettings = settings as any;
        if (user.role === 'ADMIN') {
            roleSpecificSettings = { systemSettings: typedSettings.systemSettings };
        } else if (user.role === 'ORG_ADMIN') {
            roleSpecificSettings = { organizationSettings: typedSettings.organizationSettings };
        } else {
            roleSpecificSettings = { userSettings: typedSettings.userSettings };
        }

        res.status(200).json(
            new ApiResponse(200, roleSpecificSettings, 'Settings updated successfully')
        );
    });

    /**
     * Get system settings (admin only)
     */
    getSystemSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;

        const settings = await settingsService.getOrCreateSettings(
            user._id,
            'SYSTEM',
            'ADMIN'
        );

        res.status(200).json(
            new ApiResponse(200, { systemSettings: (settings as any).systemSettings }, 'System settings fetched successfully')
        );
    });

    /**
     * Update system settings (admin only)
     */
    updateSystemSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;
        const updates = req.body;

        const settings = await settingsService.updateSystemSettings(
            user._id,
            updates
        );

        res.status(200).json(
            new ApiResponse(200, { systemSettings: (settings as any).systemSettings }, 'System settings updated successfully')
        );
    });

    /**
     * Get organization settings (org admin only)
     */
    getOrganizationSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;

        // Assuming org admin has organizationId in user object
        const organizationId = user.organizationId || req.params.organizationId;

        const settings = await settingsService.getOrCreateSettings(
            organizationId,
            'ORGANIZATION',
            'ORG_ADMIN'
        );

        res.status(200).json(
            new ApiResponse(200, { organizationSettings: (settings as any).organizationSettings }, 'Organization settings fetched successfully')
        );
    });

    /**
     * Update organization settings (org admin only)
     */
    updateOrganizationSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;
        const updates = req.body;

        // Assuming org admin has organizationId in user object
        const organizationId = user.organizationId || req.params.organizationId;

        const settings = await settingsService.updateOrganizationSettings(
            organizationId,
            updates
        );

        res.status(200).json(
            new ApiResponse(200, { organizationSettings: (settings as any).organizationSettings }, 'Organization settings updated successfully')
        );
    });

    /**
     * Get all settings for current user (all roles)
     */
    getAllSettingsForCurrentUser = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;

        const allSettings = await settingsService.getAllSettingsForOwner(
            user._id,
            'USER'
        );

        res.status(200).json(
            new ApiResponse(200, allSettings, 'All user settings fetched successfully')
        );
    });

    /**
     * Get default settings for a specific role (admin only)
     */
    getDefaultSettings = asyncHandler(async (req: any, res: Response) => {
        const role = req.params.role as 'ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

        const defaultSettings = await settingsService.getDefaultSettings(role);

        res.status(200).json(
            new ApiResponse(200, defaultSettings, 'Default settings fetched successfully')
        );
    });

    /**
     * Delete settings by type and role (admin only)
     */
    deleteSettings = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;
        const { type, role } = req.params;

        const ownerId = user._id;
        let ownerType: 'SYSTEM' | 'ORGANIZATION' | 'USER';

        switch (type) {
            case 'system':
                ownerType = 'SYSTEM';
                break;
            case 'organization':
                ownerType = 'ORGANIZATION';
                break;
            case 'user':
                ownerType = 'USER';
                break;
            default:
                throw new ApiError(400, 'Invalid settings type');
        }

        const deleteResult = await settingsService.deleteSettings(
            ownerId,
            ownerType,
            role as any
        );

        res.status(200).json(
            new ApiResponse(200, deleteResult, 'Settings deleted successfully')
        );
    });

    /**
     * Reset settings to default (admin only)
     */
    resetSettingsToDefault = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;
        const { type, role } = req.params;

        // First delete existing settings
        await settingsService.deleteSettings(
            user._id,
            type === 'system' ? 'SYSTEM' : type === 'organization' ? 'ORGANIZATION' : 'USER',
            role as any
        );

        // Get new default settings
        const defaultSettings = await settingsService.getDefaultSettings(role as any);

        res.status(200).json(
            new ApiResponse(200, defaultSettings, 'Settings reset to default successfully')
        );
    });

    /**
     * Get settings for all roles in the system (admin only)
     */
    getSystemSettingsForAllRoles = asyncHandler(async (req: any, res: Response) => {
        const { user } = req;

        const allSettings = await settingsService.getAllSettingsForOwner(
            user._id,
            'SYSTEM'
        );

        res.status(200).json(
            new ApiResponse(200, allSettings, 'All system settings fetched successfully')
        );
    });
}

export const settingsControllers = new SettingsControllers();