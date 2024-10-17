import { Request } from 'express';

export interface CustomRequest extends Request {
    token?: {
        id?: string;
        teacherId?: string;
        parentId?: string;
        studentId?: string;
        role?: string;
        email?: string;
        fullname?: string;
        avatar?: string;
        coverImage?: string;
        age?: number;
        gender?: 'male' | 'female' | 'other';
        organizationId?: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zip?: string;
            country?: string;
        };
        status?: 'active' | 'inactive';
        dateOfBirth?: Date;
        biography?: string;
        permissions?: string[];
        socialLinks?: {
            facebook?: string;
            twitter?: string;
            linkedin?: string;
        };
        preferences?: {
            notifications?: boolean;
            language?: string;
        };
    };
}
