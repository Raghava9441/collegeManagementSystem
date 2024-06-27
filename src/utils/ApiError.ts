class ApiError extends Error {
    statusCode: number;
    data: any;
    success: boolean;
    errors: any[];
    stack?: string;

    constructor(statusCode: number, data: any = null, message: string = "Something went wrong", stack?: string, errors: any[] = []) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.success = statusCode < 400;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            // Optionally you can capture the stack trace for better debugging
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
