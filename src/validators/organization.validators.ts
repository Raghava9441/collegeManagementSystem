import { body, param } from "express-validator";

const organizationValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters long"),
        body("category")
            .trim()
            .notEmpty()
            .withMessage("Category is required")
            .isLength({ min: 3 })
            .withMessage("Category must be at least 3 characters long"),
        body("number")
            .trim()
            .notEmpty()
            .withMessage("Number is required")
            .isLength({ min: 3 })
            .withMessage("Number must be at least 3 characters long"),
        body("address")
            .trim()
            .notEmpty()
            .withMessage("Address is required"),
        body("logo")
            .trim()
            .notEmpty()
            .withMessage("Logo is required"),
        body("website")
            .trim()
            .notEmpty()
            .withMessage("Website is required"),
        body("contactEmail")
            .trim()
            .notEmpty()
            .withMessage("Contact email is required")
            .isEmail()
            .withMessage("Contact email is invalid"),
        body("contactPhone")
            .trim()
            .notEmpty()
            .withMessage("Contact phone is required"),
        body("establishedDate")
            .trim()
            .notEmpty()
            .withMessage("Established date is required"),
        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description is required"),
        body("socialLinks")
            .trim()
            .notEmpty()
            .withMessage("Social links are required"),
    ];
};

export { organizationValidator };