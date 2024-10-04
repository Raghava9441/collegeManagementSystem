import { body, param, ValidationError, validationResult } from "express-validator";
import { ApiError } from "../../utils/ApiError";

export const mongoIdPathVariableValidator = (idName: string) => {
    return [
        param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
    ];
};

export const mongoIdRequestBodyValidator = (idName: string) => {
    return [body(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`)];
};


export const handleValidationErrors = (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err: ValidationError) => {
            if ('path' in err) {
                // For field validation errors
                return { [err.path]: err.msg };
            } else if (err.type === 'alternative') {
                // For alternative validation errors
                return { [err.nestedErrors[0].path]: err.msg };
            } else {
                // For any other types of errors
                return { error: err.msg };
            }
        });
        const apiError = new ApiError(400, null, 'Validation failed', undefined, extractedErrors);
        next(apiError);
    } else {
        next();
    }
};