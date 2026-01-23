import { body, param, query } from "express-validator";

/**
 * Validator for creating a new class
 */
const createClassValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Class name is required")
            .isLength({ min: 2, max: 100 })
            .withMessage("Class name must be between 2 and 100 characters"),
        body("description")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Description must not exceed 500 characters"),
        body("organizationId")
            .notEmpty()
            .withMessage("Organization ID is required")
            .isMongoId()
            .withMessage("Invalid organization ID"),
        body("courseId")
            .notEmpty()
            .withMessage("Course ID is required")
            .isMongoId()
            .withMessage("Invalid course ID"),
        body("classTeacherId")
            .notEmpty()
            .withMessage("Class teacher ID is required")
            .isMongoId()
            .withMessage("Invalid class teacher ID"),
        body("supervisorId")
            .optional()
            .isMongoId()
            .withMessage("Invalid supervisor ID"),
        body("academicYear")
            .notEmpty()
            .withMessage("Academic year is required")
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Academic year must be between 4 and 20 characters"),
        body("departmentId")
            .optional()
            .isMongoId()
            .withMessage("Invalid department ID"),
        body("schedule")
            .optional()
            .isArray()
            .withMessage("Schedule must be an array"),
        body("schedule.*.dayOfWeek")
            .optional()
            .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
            .withMessage("Invalid day of week"),
        body("schedule.*.startTime")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Start time is required for schedule"),
        body("schedule.*.endTime")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("End time is required for schedule"),
        body("classroom")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("Classroom must not exceed 50 characters"),
        body("credits")
            .optional()
            .isInt({ min: 1, max: 10 })
            .withMessage("Credits must be between 1 and 10"),
        body("maxCapacity")
            .optional()
            .isInt({ min: 1, max: 500 })
            .withMessage("Max capacity must be between 1 and 500"),
        body("currentEnrollment")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Current enrollment must be a non-negative integer"),
    ];
};

/**
 * Validator for updating a class
 */
const updateClassValidator = () => {
    return [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("Class name must be between 2 and 100 characters"),
        body("description")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Description must not exceed 500 characters"),
        body("courseId")
            .optional()
            .isMongoId()
            .withMessage("Invalid course ID"),
        body("classTeacherId")
            .optional()
            .isMongoId()
            .withMessage("Invalid class teacher ID"),
        body("supervisorId")
            .optional()
            .isMongoId()
            .withMessage("Invalid supervisor ID"),
        body("academicYear")
            .optional()
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Academic year must be between 4 and 20 characters"),
        body("departmentId")
            .optional()
            .isMongoId()
            .withMessage("Invalid department ID"),
        body("schedule")
            .optional()
            .isArray()
            .withMessage("Schedule must be an array"),
        body("schedule.*.dayOfWeek")
            .optional()
            .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
            .withMessage("Invalid day of week"),
        body("schedule.*.startTime")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("Start time is required for schedule"),
        body("schedule.*.endTime")
            .optional()
            .trim()
            .notEmpty()
            .withMessage("End time is required for schedule"),
        body("classroom")
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage("Classroom must not exceed 50 characters"),
        body("credits")
            .optional()
            .isInt({ min: 1, max: 10 })
            .withMessage("Credits must be between 1 and 10"),
        body("maxCapacity")
            .optional()
            .isInt({ min: 1, max: 500 })
            .withMessage("Max capacity must be between 1 and 500"),
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
 * Validator for teacher ID path parameter
 */
const teacherIdValidator = () => {
    return [
        param("teacherId")
            .notEmpty()
            .withMessage("Teacher ID is required")
            .isMongoId()
            .withMessage("Invalid teacher ID"),
    ];
};

/**
 * Validator for course ID path parameter
 */
const courseIdValidator = () => {
    return [
        param("courseId")
            .notEmpty()
            .withMessage("Course ID is required")
            .isMongoId()
            .withMessage("Invalid course ID"),
    ];
};

/**
 * Validator for department ID path parameter
 */
const departmentIdValidator = () => {
    return [
        param("departmentId")
            .notEmpty()
            .withMessage("Department ID is required")
            .isMongoId()
            .withMessage("Invalid department ID"),
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
 * Validator for enrolling a student
 */
const enrollStudentValidator = () => {
    return [
        body("studentId")
            .notEmpty()
            .withMessage("Student ID is required")
            .isMongoId()
            .withMessage("Invalid student ID"),
    ];
};

/**
 * Validator for enrolling multiple students
 */
const enrollMultipleStudentsValidator = () => {
    return [
        body("studentIds")
            .isArray({ min: 1 })
            .withMessage("studentIds must be a non-empty array"),
        body("studentIds.*")
            .isMongoId()
            .withMessage("Each student ID must be a valid MongoDB ID"),
    ];
};

/**
 * Validator for bulk delete classes
 */
const bulkDeleteClassesValidator = () => {
    return [
        body("classIds")
            .isArray({ min: 1 })
            .withMessage("classIds must be a non-empty array"),
        body("classIds.*")
            .isMongoId()
            .withMessage("Each class ID must be a valid MongoDB ID"),
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
 * Validator for academic year query parameter
 */
const academicYearQueryValidator = () => {
    return [
        query("academicYear")
            .optional()
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Academic year must be between 4 and 20 characters"),
    ];
};

export {
    createClassValidator,
    updateClassValidator,
    classIdValidator,
    teacherIdValidator,
    courseIdValidator,
    departmentIdValidator,
    studentIdValidator,
    enrollStudentValidator,
    enrollMultipleStudentsValidator,
    bulkDeleteClassesValidator,
    paginationValidator,
    academicYearQueryValidator,
};
