import { Settings } from '../models/settings.models';
import { ApiError } from '../utils/ApiError';

// Interface for settings update
interface SettingsUpdateData {
    systemSettings?: any;
    organizationSettings?: any;
    userSettings?: any;
}

class SettingsService {

    /**
     * Get or create settings for a specific owner and role
     */
    async getOrCreateSettings(
        ownerId: string,
        ownerType: 'SYSTEM' | 'ORGANIZATION' | 'USER',
        role: 'ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' = 'STUDENT'
    ): Promise<any> {
        try {
            let settings = await Settings.findOne({
                owner: ownerId,
                ownerType,
                role
            });

            if (!settings) {
                settings = new Settings({
                    owner: ownerId,
                    ownerType,
                    role
                });
                await settings.save();
            }

            return settings;
        } catch (error) {
            throw new ApiError(500, 'Failed to get settings');
        }
    }

    /**
     * Get all settings for a specific owner
     */
    async getSettingsByOwner(
        ownerId: string,
        ownerType: 'SYSTEM' | 'ORGANIZATION' | 'USER'
    ): Promise<typeof Settings[]> {
        try {
            const settings = await Settings.find({
                owner: ownerId,
                ownerType
            });
            return settings;
        } catch (error) {
            throw new ApiError(500, 'Failed to get settings');
        }
    }

    /**
     * Update system settings (admin only)
     */
    async updateSystemSettings(
        ownerId: string,
        updates: SettingsUpdateData
    ): Promise<typeof Settings> {
        try {
            const settings = await this.getOrCreateSettings(ownerId, 'SYSTEM', 'ADMIN');
            const typedSettings = settings as any;
            
            if (updates.systemSettings) {
                // Merge updates instead of replacing entirely
                if (updates.systemSettings.site) {
                    typedSettings.systemSettings.site = {
                        ...typedSettings.systemSettings.site,
                        ...updates.systemSettings.site
                    };
                }
                if (updates.systemSettings.security) {
                    if (updates.systemSettings.security.password) {
                        typedSettings.systemSettings.security.password = {
                            ...typedSettings.systemSettings.security.password,
                            ...updates.systemSettings.security.password
                        };
                    }
                    if (updates.systemSettings.security.session) {
                        typedSettings.systemSettings.security.session = {
                            ...typedSettings.systemSettings.security.session,
                            ...updates.systemSettings.security.session
                        };
                    }
                }
                if (updates.systemSettings.email) {
                    if (updates.systemSettings.email.smtp) {
                        if (updates.systemSettings.email.smtp.auth) {
                            typedSettings.systemSettings.email.smtp.auth = {
                                ...typedSettings.systemSettings.email.smtp.auth,
                                ...updates.systemSettings.email.smtp.auth
                            };
                        }
                        typedSettings.systemSettings.email.smtp = {
                            ...typedSettings.systemSettings.email.smtp,
                            ...updates.systemSettings.email.smtp
                        };
                    }
                    typedSettings.systemSettings.email = {
                        ...typedSettings.systemSettings.email,
                        ...updates.systemSettings.email
                    };
                }
                if (updates.systemSettings.notifications) {
                    typedSettings.systemSettings.notifications = {
                        ...typedSettings.systemSettings.notifications,
                        ...updates.systemSettings.notifications
                    };
                }
                if (updates.systemSettings.pagination) {
                    typedSettings.systemSettings.pagination = {
                        ...typedSettings.systemSettings.pagination,
                        ...updates.systemSettings.pagination
                    };
                }
            }

            await typedSettings.save();
            return settings;
        } catch (error) {
            throw new ApiError(500, 'Failed to update system settings');
        }
    }

    /**
     * Update organization settings (org admin only)
     */
    async updateOrganizationSettings(
        ownerId: string,
        updates: SettingsUpdateData
    ): Promise<typeof Settings> {
        try {
            const settings = await this.getOrCreateSettings(ownerId, 'ORGANIZATION', 'ORG_ADMIN');
            const typedSettings = settings as any;
            
            if (updates.organizationSettings) {
                if (updates.organizationSettings.general) {
                    if (updates.organizationSettings.general.address) {
                        typedSettings.organizationSettings.general.address = {
                            ...typedSettings.organizationSettings.general.address,
                            ...updates.organizationSettings.general.address
                        };
                    }
                    if (updates.organizationSettings.general.contact) {
                        typedSettings.organizationSettings.general.contact = {
                            ...typedSettings.organizationSettings.general.contact,
                            ...updates.organizationSettings.general.contact
                        };
                    }
                    typedSettings.organizationSettings.general = {
                        ...typedSettings.organizationSettings.general,
                        ...updates.organizationSettings.general
                    };
                }
                if (updates.organizationSettings.academic) {
                    if (updates.organizationSettings.academic.gradingSystem) {
                        typedSettings.organizationSettings.academic.gradingSystem = {
                            ...typedSettings.organizationSettings.academic.gradingSystem,
                            ...updates.organizationSettings.academic.gradingSystem
                        };
                    }
                    if (updates.organizationSettings.academic.attendance) {
                        typedSettings.organizationSettings.academic.attendance = {
                            ...typedSettings.organizationSettings.academic.attendance,
                            ...updates.organizationSettings.academic.attendance
                        };
                    }
                    typedSettings.organizationSettings.academic = {
                        ...typedSettings.organizationSettings.academic,
                        ...updates.organizationSettings.academic
                    };
                }
                if (updates.organizationSettings.departments) {
                    typedSettings.organizationSettings.departments = {
                        ...typedSettings.organizationSettings.departments,
                        ...updates.organizationSettings.departments
                    };
                }
                if (updates.organizationSettings.notifications) {
                    typedSettings.organizationSettings.notifications = {
                        ...typedSettings.organizationSettings.notifications,
                        ...updates.organizationSettings.notifications
                    };
                }
                if (updates.organizationSettings.security) {
                    typedSettings.organizationSettings.security = {
                        ...typedSettings.organizationSettings.security,
                        ...updates.organizationSettings.security
                    };
                }
            }

            await typedSettings.save();
            return settings;
        } catch (error) {
            throw new ApiError(500, 'Failed to update organization settings');
        }
    }

    /**
     * Update user settings (teacher, student, parent)
     */
    async updateUserSettings(
        ownerId: string,
        role: 'TEACHER' | 'STUDENT' | 'PARENT',
        updates: SettingsUpdateData
    ): Promise<typeof Settings> {
        try {
            const settings = await this.getOrCreateSettings(ownerId, 'USER', role);
            const typedSettings = settings as any;
            
            if (updates.userSettings) {
                if (updates.userSettings.profile) {
                    typedSettings.userSettings.profile = {
                        ...typedSettings.userSettings.profile,
                        ...updates.userSettings.profile
                    };
                }
                if (updates.userSettings.notifications) {
                    typedSettings.userSettings.notifications = {
                        ...typedSettings.userSettings.notifications,
                        ...updates.userSettings.notifications
                    };
                }
                if (updates.userSettings.preferences) {
                    typedSettings.userSettings.preferences = {
                        ...typedSettings.userSettings.preferences,
                        ...updates.userSettings.preferences
                    };
                }
                if (updates.userSettings.academics) {
                    typedSettings.userSettings.academics = {
                        ...typedSettings.userSettings.academics,
                        ...updates.userSettings.academics
                    };
                }
                if (updates.userSettings.dashboard) {
                    if (updates.userSettings.dashboard.widgets) {
                        typedSettings.userSettings.dashboard.widgets = {
                            ...typedSettings.userSettings.dashboard.widgets,
                            ...updates.userSettings.dashboard.widgets
                        };
                    }
                    typedSettings.userSettings.dashboard = {
                        ...typedSettings.userSettings.dashboard,
                        ...updates.userSettings.dashboard
                    };
                }
            }

            await typedSettings.save();
            return settings;
        } catch (error) {
            throw new ApiError(500, 'Failed to update user settings');
        }
    }

    /**
     * Update settings based on role
     */
    async updateSettingsByRole(
        ownerId: string,
        role: 'ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT',
        updates: SettingsUpdateData
    ): Promise<typeof Settings> {
        switch (role) {
            case 'ADMIN':
                return await this.updateSystemSettings(ownerId, updates);
            case 'ORG_ADMIN':
                return await this.updateOrganizationSettings(ownerId, updates);
            case 'TEACHER':
            case 'STUDENT':
            case 'PARENT':
                return await this.updateUserSettings(ownerId, role, updates);
            default:
                throw new ApiError(400, 'Invalid role');
        }
    }

    /**
     * Get settings by type
     */
    async getSettingsByType(
        ownerId: string,
        type: 'system' | 'organization' | 'user',
        role: 'ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' = 'STUDENT'
    ): Promise<typeof Settings> {
        try {
            const ownerType = type === 'system' ? 'SYSTEM' : type === 'organization' ? 'ORGANIZATION' : 'USER';
            const settings = await this.getOrCreateSettings(ownerId, ownerType, role);
            return settings;
        } catch (error) {
            throw new ApiError(500, 'Failed to get settings');
        }
    }

    /**
     * Delete settings
     */
    async deleteSettings(
        ownerId: string,
        ownerType: 'SYSTEM' | 'ORGANIZATION' | 'USER',
        role?: 'ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
    ): Promise<{ deletedCount: number }> {
        try {
            const query: any = { owner: ownerId, ownerType };
            if (role) {
                query.role = role;
            }

            const result = await Settings.deleteMany(query);
            return { deletedCount: result.deletedCount };
        } catch (error) {
            throw new ApiError(500, 'Failed to delete settings');
        }
    }

    /**
     * Get all available settings for all roles and types for an owner
     */
    async getAllSettingsForOwner(
        ownerId: string,
        ownerType: 'SYSTEM' | 'ORGANIZATION' | 'USER'
    ): Promise<{
        admin?: typeof Settings;
        orgAdmin?: typeof Settings;
        teacher?: typeof Settings;
        student?: typeof Settings;
        parent?: typeof Settings;
    }> {
        try {
            const settings = await Settings.find({
                owner: ownerId,
                ownerType
            });

            const result: any = {};
            settings.forEach(setting => {
                switch (setting.role) {
                    case 'ADMIN':
                        result.admin = setting.getRoleSpecificSettings(setting.role);
                        break;
                    case 'ORG_ADMIN':
                        result.orgAdmin = setting.getRoleSpecificSettings(setting.role);
                        break;
                    case 'TEACHER':
                        result.teacher = setting.getRoleSpecificSettings(setting.role);
                        break;
                    case 'STUDENT':
                        result.student = setting.getRoleSpecificSettings(setting.role);
                        break;
                    case 'PARENT':
                        result.parent = setting.getRoleSpecificSettings(setting.role);
                        break;
                }
            });

            return result;
        } catch (error) {
            throw new ApiError(500, 'Failed to get all settings');
        }
    }

    /**
     * Get default settings for a specific role
     */
    async getDefaultSettings(role: 'ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'): Promise<any> {
        try {
            const tempSettings = new Settings({
                owner: 'temp',
                ownerType: 'SYSTEM',
                role
            });
            return tempSettings.getRoleSpecificSettings(role);
        } catch (error) {
            throw new ApiError(500, 'Failed to get default settings');
        }
    }
}

export const settingsService = new SettingsService();