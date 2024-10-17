import { Request } from 'express';

interface UserDocument {
    id: string;
    teacherId: string;
    parentId: string;
    studentId: string;
    role: string;
    email: string;
    fullname: string;
    avatar: string;
    coverImage: string;
    age: string;
    gender: string;
    organizationId: string;
    phone: string;
    address: string;
    status: string;
    dateOfBirth: string;
    biography: string;
    permissions: string[];
    socialLinks: {
        facebook: string;
        twitter: string;
        linkedin: string;
    };
    preferences: {
        notifications: boolean;
        language: string;
    };
}

declare module 'express' {
    interface Request {
        user?: UserDocument; // Make it optional
    }
}