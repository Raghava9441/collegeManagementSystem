
import mongoose, { Schema, Model, Document } from 'mongoose';
export interface IUser extends Document {
    username: string;
    email: string;
    fullname: string;
    avatar: string;
    coverImage?: string;
    age?: number;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    gender: 'male' | 'female' | 'other';
    organizationId: string;
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
    password: string;
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
}



const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,//cloudinary url
            required: true,
        },
        coverImage: {
            type: String,//cloudinary url
        },
        age: {
            type: Number,
            min: 15,
            max: 100,
        },
        role: {
            type: String,
            enum: ['admin', 'teacher', 'student', 'parent'],
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        organizationId: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            trim: true
        },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String }
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        dateOfBirth: {
            type: Date
        },
        biography: {
            type: String
        },
        permissions: [{
            type: String
        }],
        socialLinks: {
            facebook: { type: String },
            twitter: { type: String },
            linkedin: { type: String }
        },
        preferences: {
            notifications: { type: Boolean, default: true },
            language: { type: String, default: 'en' }
        },
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String,
            required: [true, "refreshToken is required"]
        },
    },
    {
        timestamps: true
    }
)

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);