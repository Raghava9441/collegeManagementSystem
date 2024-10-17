import { body, param } from "express-validator";

const courseValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters long"),
        // body("description")
        //     .trim()
        //     .notEmpty()
        //     .withMessage("Description is required"),
        // body("teacherIds")
        //     .trim()
        //     .notEmpty()
        //     .withMessage("Teacher IDs are required"),
        body("organizationId")
            .trim()
            .notEmpty()
            .withMessage("Organization ID is required"),
        // body("subjectsIds")
        //     .trim()
        //     .notEmpty()
        //     .withMessage("Subject IDs are required"),
        body("startDate")
            .trim()
            .notEmpty()
            .withMessage("Start date is required"),
        body("endDate")
            .trim()
            .notEmpty()
            .withMessage("End date is required"),
        body("schedule")
            .trim()
            .notEmpty()
            .withMessage("Schedule is required"),
    ];
};

export { courseValidator };