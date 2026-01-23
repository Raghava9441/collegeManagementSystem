import { body, param, query } from "express-validator";

/**
 * Validator for creating a new attendance record
 */
const createAttendanceValidator = () => {
    return [
        body("classId")
            .notEmpty()
            .withMessage("Class ID is required")
            .isMongoId()
            .withMessage("Invalid class ID"),
        body("studentId")
            .notEmpty()
            .withMessage("Student ID is required")
            .isMongoId()
            .withMessage("Invalid student ID"),
        body("date")
            .notEmpty()
            .withMessage("Date is required")
            .isISO8601()
            .withMessage("Date must be a valid date"),
        body("status")
            .notEmpty()
            .withMessage("Status is required")
            .isIn(["present", "absent", "excused"])
            .withMessage("Status must be one of: present, absent, excused"),
        body("remarks")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Remarks must not exceed 500 characters"),
        body("markedBy")
            .notEmpty()
            .withMessage("Marked by (Teacher ID) is required")
            .isMongoId()
            .withMessage("Invalid teacher ID"),
    ];
};

/**
 * Validator for updating an attendance record
 */
const updateAttendanceValidator = () => {
    return [
        body("classId")
            .optional()
            .isMongoId()
            .withMessage("Invalid class ID"),
        body("studentId")
            .optional()
            .isMongoId()
            .withMessage("Invalid student ID"),
        body("date")
            .optional()
            .isISO8601()
            .withMessage("Date must be a valid date"),
        body("status")
            .optional()
            .isIn(["present", "absent", "excused"])
            .withMessage("Status must be one of: present, absent, excused"),
        body("remarks")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Remarks must not exceed 500 characters"),
        body("markedBy")
            .optional()
            .isMongoId()
            .withMessage("Invalid teacher ID"),
    ];
};

/**
 * Validator for attendance ID path parameter
 */
const attendanceIdValidator = () => {
    return [
        param("attendanceId")
            .notEmpty()
            .withMessage("Attendance ID is required")
            .isMongoId()
            .withMessage("Invalid attendance ID"),
    ];
};

/**
 * Validator for student ID path parameter
 */
const studentIdValidator = () => {
    return [
        param("studentId")
            .notEmpty()
            .withMessage("Student ID is required")
            .isMongoId()
            .withMessage("Invalid student ID"),
    ];
};

/**
 * Validator for class ID path parameter
 */
const classIdValidator = () => {
    return [
        param("classId")
            .notEmpty()
            .withMessage("Class ID is required")
            .isMongoId()
            .withMessage("Invalid class ID"),
    ];
};

/**
 * Validator for bulk delete attendances
 */
const bulkDeleteAttendancesValidator = () => {
    return [
        body("attendanceIds")
            .isArray({ min: 1 })
            .withMessage("attendanceIds must be a non-empty array"),
        body("attendanceIds.*")
            .isMongoId()
            .withMessage("Each attendance ID must be a valid MongoDB ID"),
    ];
};

/**
 * Validator for pagination query parameters
 */
const paginationValidator = () => {
    return [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
    ];
};

/**
 * Validator for date query parameter
 */
const dateQueryValidator = () => {
    return [
        query("date")
            .optional()
            .isISO8601()
            .withMessage("Date must be a valid date"),
    ];
};

/**
 * Validator for date range query parameters
 */
const dateRangeQueryValidator = () => {
    return [
        query("startDate")
            .optional()
            .isISO8601()
            .withMessage("Start date must be a valid date"),
        query("endDate")
            .optional()
            .isISO8601()
            .withMessage("End date must be a valid date")
            .custom((value, { req }) => {
                if (req.query?.startDate && value) {
                    if (new Date(value) < new Date(req.query.startDate)) {
                        throw new Error("End date must be after start date");
                    }
                }
                return true;
            }),
    ];
};

/**
 * Validator for status query parameter
 */
const statusQueryValidator = () => {
    return [
        query("status")
            .optional()
            .isIn(["present", "absent", "excused"])
            .withMessage("Status must be one of: present, absent, excused"),
    ];
};

/**
 * Validator for bulk mark attendance
 */
const bulkMarkAttendanceValidator = () => {
    return [
        body("classId")
            .notEmpty()
            .withMessage("Class ID is required")
            .isMongoId()
            .withMessage("Invalid class ID"),
        body("date")
            .notEmpty()
            .withMessage("Date is required")
            .isISO8601()
            .withMessage("Date must be a valid date"),
        body("markedBy")
            .notEmpty()
            .withMessage("Marked by (Teacher ID) is required")
            .isMongoId()
            .withMessage("Invalid teacher ID"),
        body("attendanceRecords")
            .isArray({ min: 1 })
            .withMessage("attendanceRecords must be a non-empty array"),
        body("attendanceRecords.*.studentId")
            .notEmpty()
            .withMessage("Student ID is required for each record")
            .isMongoId()
            .withMessage("Invalid student ID"),
        body("attendanceRecords.*.status")
            .notEmpty()
            .withMessage("Status is required for each record")
            .isIn(["present", "absent", "excused"])
            .withMessage("Status must be one of: present, absent, excused"),
        body("attendanceRecords.*.remarks")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Remarks must not exceed 500 characters"),
    ];
};

export {
    createAttendanceValidator,
    updateAttendanceValidator,
    attendanceIdValidator,
    studentIdValidator,
    classIdValidator,
    bulkDeleteAttendancesValidator,
    paginationValidator,
    dateQueryValidator,
    dateRangeQueryValidator,
    statusQueryValidator,
    bulkMarkAttendanceValidator,
};
