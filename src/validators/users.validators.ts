import { body, param } from "express-validator";
import { AvailableUserRoles } from "../constants";

const createuservalidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at lease 3 characters long"),
        body("fullname")
            .trim()
            .notEmpty()
            .withMessage("Fullname is required"),
        // body("avatar")
        //     .trim()
        //     .notEmpty()
        //     .withMessage("Avatar is required"),
        // body("coverImage")
        //     .trim()
        //     .notEmpty()
        //     .withMessage("Cover image is required"),
        body("age")
            .trim()
            .notEmpty()
            .withMessage("Age is required"),
        body("role")
            .optional()
            .isIn(AvailableUserRoles)
            .withMessage("Invalid user role"),
        body("gender")
            .trim()
            .notEmpty()
            .withMessage("Gender is required"),
        body("organizationId")
            .trim()
            .notEmpty()
            .withMessage("Organization id is required"),
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Phone is required"),
        body("status")
            .trim()
            .notEmpty()
            .withMessage("Status is required"),
        // body("dateOfBirth")
        //     .trim()
        //     .notEmpty()
        //     .withMessage("Date of birth is required"),
        body("permissions")
            .trim()
            .notEmpty()
            .withMessage("Permissions is required"),
        body("preferences")
            .trim()
            .notEmpty()
            .withMessage("Preferences is required"),
        body("role")
            .optional()
            .isIn(AvailableUserRoles)
            .withMessage("Invalid user role"),
    ]
}

const userLoginValidator = () => {
    return [
        body("email").optional().isEmail().withMessage("Email is invalid"),
        //   body("username").optional(),
        body("password").notEmpty().withMessage("Password is required"),
    ];
};

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password is required"),
    ];
};

export {
    createuservalidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator
}