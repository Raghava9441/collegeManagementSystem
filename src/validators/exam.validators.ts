import { body, param, query } from "express-validator";

/**
 * Validator for creating a new exam
 */
const createExamValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Exam name is required")
            .isLength({ min: 3, max: 100 })
            .withMessage("Exam name must be between 3 and 100 characters"),
        body("description")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Description must not exceed 500 characters"),
        body("subjectId")
            .optional()
            .isMongoId()
            .withMessage("Invalid subject ID"),
        body("courseId")
            .optional()
            .isMongoId()
            .withMessage("Invalid course ID"),
        body("classId")
            .optional()
            .isMongoId()
            .withMessage("Invalid class ID"),
        body("teacherId")
            .optional()
            .isMongoId()
            .withMessage("Invalid teacher ID"),
        body("duration")
            .notEmpty()
            .withMessage("Duration is required")
            .isInt({ min: 1, max: 480 })
            .withMessage("Duration must be between 1 and 480 minutes"),
        body("totalMarks")
            .notEmpty()
            .withMessage("Total marks is required")
            .isInt({ min: 1, max: 1000 })
            .withMessage("Total marks must be between 1 and 1000"),
        body("examType")
            .notEmpty()
            .withMessage("Exam type is required")
            .isIn(["quiz", "midterm", "final"])
            .withMessage("Exam type must be one of: quiz, midterm, final"),
        body("startDate")
            .notEmpty()
            .withMessage("Start date is required")
            .isISO8601()
            .withMessage("Start date must be a valid date"),
        body("endDate")
            .notEmpty()
            .withMessage("End date is required")
            .isISO8601()
            .withMessage("End date must be a valid date")
            .custom((value, { req }) => {
                if (new Date(value) <= new Date(req.body.startDate)) {
                    throw new Error("End date must be after start date");
                }
                return true;
            }),
        body("schedule")
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage("Schedule must not exceed 200 characters"),
    ];
};

/**
 * Validator for updating an exam
 */
const updateExamValidator = () => {
    return [
        body("name")
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage("Exam name must be between 3 and 100 characters"),
        body("description")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Description must not exceed 500 characters"),
        body("subjectId")
            .optional()
            .isMongoId()
            .withMessage("Invalid subject ID"),
        body("courseId")
            .optional()
            .isMongoId()
            .withMessage("Invalid course ID"),
        body("classId")
            .optional()
            .isMongoId()
            .withMessage("Invalid class ID"),
        body("teacherId")
            .optional()
            .isMongoId()
            .withMessage("Invalid teacher ID"),
        body("duration")
            .optional()
            .isInt({ min: 1, max: 480 })
            .withMessage("Duration must be between 1 and 480 minutes"),
        body("totalMarks")
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage("Total marks must be between 1 and 1000"),
        body("examType")
            .optional()
            .isIn(["quiz", "midterm", "final"])
            .withMessage("Exam type must be one of: quiz, midterm, final"),
        body("startDate")
            .optional()
            .isISO8601()
            .withMessage("Start date must be a valid date"),
        body("endDate")
            .optional()
            .isISO8601()
            .withMessage("End date must be a valid date"),
        body("schedule")
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage("Schedule must not exceed 200 characters"),
    ];
};

/**
 * Validator for exam ID path parameter
 */
const examIdValidator = () => {
    return [
        param("examId")
            .notEmpty()
            .withMessage("Exam ID is required")
            .isMongoId()
            .withMessage("Invalid exam ID"),
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
 * Validator for exam type query parameter
 */
const examTypeQueryValidator = () => {
    return [
        query("type")
            .notEmpty()
            .withMessage("Exam type is required")
            .isIn(["quiz", "midterm", "final"])
            .withMessage("Exam type must be one of: quiz, midterm, final"),
    ];
};

/**
 * Validator for bulk delete exams
 */
const bulkDeleteExamsValidator = () => {
    return [
        body("examIds")
            .isArray({ min: 1 })
            .withMessage("examIds must be a non-empty array"),
        body("examIds.*")
            .isMongoId()
            .withMessage("Each exam ID must be a valid MongoDB ID"),
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

export {
    createExamValidator,
    updateExamValidator,
    examIdValidator,
    classIdValidator,
    teacherIdValidator,
    courseIdValidator,
    examTypeQueryValidator,
    bulkDeleteExamsValidator,
    paginationValidator,
};
