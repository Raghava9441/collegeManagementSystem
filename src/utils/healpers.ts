import { IUser } from "../models/user.models";
import nodemailer from 'nodemailer';
interface PaginationOptions {
    page?: number;
    limit?: number;
    customLabels?: Record<string, string>;
}

interface MongoosePaginationOptions {
    page: number;
    limit: number;
    pagination: boolean;
    customLabels: Record<string, string>;
}

export const getMongoosePaginationOptions = ({
    page = 1,
    limit = 10,
    customLabels = {},
}: PaginationOptions): MongoosePaginationOptions => {
    return {
        page: Math.max(page, 1),
        limit: Math.max(limit, 1),
        pagination: true,
        customLabels: {
            pagingCounter: "serialNumberStartFrom",
            ...customLabels,
        },
    };
};

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
    params: Record<string, any>;
}


export const sendEmail = async (to: string, name: string, password: string) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Welcome to Our Service',
        text: `Hello ${name},\n\nWelcome! Your account has been created successfully.\n\nYour temporary password is: ${password}\n\nPlease change it after your first login.\n\nBest regards,\nYour Company Name`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
};