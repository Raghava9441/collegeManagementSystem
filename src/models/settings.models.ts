import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const settingsSchema = new Schema(
    {
        // Owner information - determines who this settings belongs to
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        ownerType: {
            type: String,
            enum: ['SYSTEM', 'ORGANIZATION', 'USER'],
            required: true
        },
        role: {
            type: String,
            enum: ['ADMIN', 'ORG_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
            default: 'USER'
        },
        
        // System-wide settings (for ADMIN)
        systemSettings: {
            site: {
                name: { type: String, default: 'College Management System' },
                logo: { type: String },
                favicon: { type: String },
                description: { type: String },
                contactEmail: { type: String },
                contactPhone: { type: String }
            },
            security: {
                password: {
                    minLength: { type: Number, default: 8 },
                    requireUppercase: { type: Boolean, default: true },
                    requireLowercase: { type: Boolean, default: true },
                    requireNumbers: { type: Boolean, default: true },
                    requireSpecialChars: { type: Boolean, default: true }
                },
                session: {
                    timeout: { type: Number, default: 86400 }, // 24 hours in seconds
                    maxSessions: { type: Number, default: 5 }
                }
            },
            email: {
                fromName: { type: String },
                fromEmail: { type: String },
                smtp: {
                    host: { type: String },
                    port: { type: Number },
                    secure: { type: Boolean, default: true },
                    auth: {
                        user: { type: String },
                        pass: { type: String }
                    }
                }
            },
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: false },
                push: { type: Boolean, default: true }
            },
            pagination: {
                defaultPageSize: { type: Number, default: 10 },
                maxPageSize: { type: Number, default: 100 }
            }
        },

        // Organization settings (for ORG_ADMIN)
        organizationSettings: {
            general: {
                name: { type: String },
                address: {
                    street: { type: String },
                    city: { type: String },
                    state: { type: String },
                    zip: { type: String },
                    country: { type: String }
                },
                contact: {
                    email: { type: String },
                    phone: { type: String }
                },
                logo: { type: String },
                website: { type: String }
            },
            academic: {
                academicYear: { type: String },
                semester: { type: String },
                gradingSystem: {
                    type: { type: String, enum: ['percentage', 'cgpa', 'grade'], default: 'percentage' },
                    scale: { type: Number, default: 100 }
                },
                attendance: {
                    requiredPercentage: { type: Number, default: 75 },
                    markingPeriod: { type: Number, default: 30 } // days
                }
            },
            departments: {
                requireApproval: { type: Boolean, default: true },
                maxCoursesPerDepartment: { type: Number, default: 50 }
            },
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: false },
                push: { type: Boolean, default: true }
            },
            security: {
                allowExternalUsers: { type: Boolean, default: false },
                requireTwoFactor: { type: Boolean, default: false },
                sessionTimeout: { type: Number, default: 86400 } // 24 hours in seconds
            }
        },

        // User settings (for TEACHER, STUDENT, PARENT)
        userSettings: {
            profile: {
                showEmail: { type: Boolean, default: true },
                showPhone: { type: Boolean, default: true },
                showAddress: { type: Boolean, default: false },
                privacy: { type: String, enum: ['public', 'private', 'contacts'], default: 'public' }
            },
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: false },
                push: { type: Boolean, default: true },
                desktop: { type: Boolean, default: false },
                weeklyReport: { type: Boolean, default: true },
                assignmentReminders: { type: Boolean, default: true },
                attendanceReminders: { type: Boolean, default: false },
                examNotifications: { type: Boolean, default: true }
            },
            preferences: {
                language: { type: String, default: 'en' },
                timezone: { type: String, default: 'UTC' },
                theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
                fontSize: { type: Number, default: 16 }
            },
            academics: {
                // Teacher settings
                gradeReleaseMethod: { type: String, enum: ['manual', 'auto'], default: 'manual' },
                assignmentDeadlineReminder: { type: Number, default: 24 }, // hours before deadline
                // Student settings
                studyMode: { type: Boolean, default: false },
                showGrades: { type: Boolean, default: true },
                // Parent settings
                childUpdates: { type: Boolean, default: true },
                attendanceAlerts: { type: Number, default: 3 } // absences before alert
            },
            dashboard: {
                widgets: {
                    recentAssignments: { type: Boolean, default: true },
                    upcomingExams: { type: Boolean, default: true },
                    attendanceStats: { type: Boolean, default: true },
                    gradesOverview: { type: Boolean, default: true },
                    announcements: { type: Boolean, default: true },
                    calendar: { type: Boolean, default: true },
                    performanceMetrics: { type: Boolean, default: false }
                },
                layout: { type: String, enum: ['grid', 'list'], default: 'grid' },
                defaultView: { type: String, enum: ['overview', 'academics', 'schedule'], default: 'overview' }
            }
        }
    },
    {
        timestamps: true
    }
);

// Create a compound index for quick lookups by owner and owner type
settingsSchema.index({ owner: 1, ownerType: 1, role: 1 }, { unique: true });

// Helper method to get settings for specific role
settingsSchema.methods.getRoleSpecificSettings = function(role: string) {
    if (role === 'ADMIN') {
        return { systemSettings: this.systemSettings };
    } else if (role === 'ORG_ADMIN') {
        return { organizationSettings: this.organizationSettings };
    } else {
        return { userSettings: this.userSettings };
    }
};

settingsSchema.plugin(mongooseAggregatePaginate);
export const Settings = mongoose.model('Settings', settingsSchema);