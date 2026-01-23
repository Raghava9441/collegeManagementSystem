import { body, param } from "express-validator";

// System settings validator
const systemSettingsValidator = () => {
    return [
        body("site.name").optional().trim().isLength({ min: 3 }),
        body("site.logo").optional().trim(),
        body("site.favicon").optional().trim(),
        body("site.description").optional().trim(),
        body("site.contactEmail").optional().isEmail(),
        body("site.contactPhone").optional().trim(),
        
        body("security.password.minLength").optional().isInt({ min: 6, max: 128 }),
        body("security.password.requireUppercase").optional().isBoolean(),
        body("security.password.requireLowercase").optional().isBoolean(),
        body("security.password.requireNumbers").optional().isBoolean(),
        body("security.password.requireSpecialChars").optional().isBoolean(),
        body("security.session.timeout").optional().isInt({ min: 300, max: 259200 }), // 5 mins to 3 days
        body("security.session.maxSessions").optional().isInt({ min: 1, max: 20 }),
        
        body("email.fromName").optional().trim(),
        body("email.fromEmail").optional().isEmail(),
        body("email.smtp.host").optional().trim(),
        body("email.smtp.port").optional().isInt({ min: 1, max: 65535 }),
        body("email.smtp.secure").optional().isBoolean(),
        body("email.smtp.auth.user").optional().trim(),
        body("email.smtp.auth.pass").optional().trim(),
        
        body("notifications.email").optional().isBoolean(),
        body("notifications.sms").optional().isBoolean(),
        body("notifications.push").optional().isBoolean(),
        
        body("pagination.defaultPageSize").optional().isInt({ min: 5, max: 100 }),
        body("pagination.maxPageSize").optional().isInt({ min: 10, max: 500 })
    ];
};

// Organization settings validator
const organizationSettingsValidator = () => {
    return [
        body("general.name").optional().trim().isLength({ min: 3 }),
        body("general.logo").optional().trim(),
        body("general.website").optional().isURL(),
        body("general.contact.email").optional().isEmail(),
        body("general.contact.phone").optional().trim(),
        
        body("academic.academicYear").optional().trim(),
        body("academic.semester").optional().trim(),
        body("academic.gradingSystem.type").optional().isIn(['percentage', 'cgpa', 'grade']),
        body("academic.gradingSystem.scale").optional().isInt({ min: 0, max: 100 }),
        body("academic.attendance.requiredPercentage").optional().isFloat({ min: 0, max: 100 }),
        body("academic.attendance.markingPeriod").optional().isInt({ min: 1, max: 365 }),
        
        body("departments.requireApproval").optional().isBoolean(),
        body("departments.maxCoursesPerDepartment").optional().isInt({ min: 1, max: 100 }),
        
        body("notifications.email").optional().isBoolean(),
        body("notifications.sms").optional().isBoolean(),
        body("notifications.push").optional().isBoolean(),
        
        body("security.allowExternalUsers").optional().isBoolean(),
        body("security.requireTwoFactor").optional().isBoolean(),
        body("security.sessionTimeout").optional().isInt({ min: 300, max: 259200 })
    ];
};

// User settings validator
const userSettingsValidator = () => {
    return [
        body("profile.showEmail").optional().isBoolean(),
        body("profile.showPhone").optional().isBoolean(),
        body("profile.showAddress").optional().isBoolean(),
        body("profile.privacy").optional().isIn(['public', 'private', 'contacts']),
        
        body("notifications.email").optional().isBoolean(),
        body("notifications.sms").optional().isBoolean(),
        body("notifications.push").optional().isBoolean(),
        body("notifications.desktop").optional().isBoolean(),
        body("notifications.weeklyReport").optional().isBoolean(),
        body("notifications.assignmentReminders").optional().isBoolean(),
        body("notifications.attendanceReminders").optional().isBoolean(),
        body("notifications.examNotifications").optional().isBoolean(),
        
        body("preferences.language").optional().trim(),
        body("preferences.timezone").optional().trim(),
        body("preferences.theme").optional().isIn(['light', 'dark', 'auto']),
        body("preferences.fontSize").optional().isInt({ min: 10, max: 24 }),
        
        body("academics.gradeReleaseMethod").optional().isIn(['manual', 'auto']),
        body("academics.assignmentDeadlineReminder").optional().isInt({ min: 1, max: 168 }),
        body("academics.studyMode").optional().isBoolean(),
        body("academics.showGrades").optional().isBoolean(),
        body("academics.childUpdates").optional().isBoolean(),
        body("academics.attendanceAlerts").optional().isInt({ min: 1, max: 20 }),
        
        body("dashboard.widgets.recentAssignments").optional().isBoolean(),
        body("dashboard.widgets.upcomingExams").optional().isBoolean(),
        body("dashboard.widgets.attendanceStats").optional().isBoolean(),
        body("dashboard.widgets.gradesOverview").optional().isBoolean(),
        body("dashboard.widgets.announcements").optional().isBoolean(),
        body("dashboard.widgets.calendar").optional().isBoolean(),
        body("dashboard.widgets.performanceMetrics").optional().isBoolean(),
        body("dashboard.layout").optional().isIn(['grid', 'list']),
        body("dashboard.defaultView").optional().isIn(['overview', 'academics', 'schedule'])
    ];
};

// MongoDB ID validator
const mongoIdPathVariableValidator = (paramName: string = 'settingsId') => {
    return param(paramName)
        .notEmpty()
        .withMessage(`Invalid ${paramName}`)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`);
};

export {
    systemSettingsValidator,
    organizationSettingsValidator,
    userSettingsValidator,
    mongoIdPathVariableValidator
};