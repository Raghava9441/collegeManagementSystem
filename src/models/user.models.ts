import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AvailableUserRoles } from '../constants';
export interface IUser extends Document {
    username: string;
    email: string;
    fullname: string;
    avatar: string;
    coverImage?: string;
    age?: string;
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
    password?: string;
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
    isPasswordCorrect(password: string | Buffer): Promise<boolean>;
    genetateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema(
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
            type: String,
            min: 15,
            max: 100,
        },
        role: {
            type: String,
            enum: AvailableUserRoles,
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
            required: true
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

// Hash password before saving to database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10);

    next()
})
// Compare password with hashed password in database
userSchema.methods.isPasswordCorrect = async function (password: string | Buffer) {
    return await bcrypt.compare(password, this.password);
}
// Generate access token
userSchema.methods.genetateAccessToken = function () {
    const payload = {
        id: this._id,
        role: this.role,
        email: this.email,
        fullname: this.fullname,
        avatar: this.avatar,
        coverImage: this.coverImage,
        age: this.age,
        gender: this.gender,
        organizationId: this.organizationId,
        phone: this.phone,
        address: this.address,
        status: this.status,
        dateOfBirth: this.dateOfBirth,
        biography: this.biography,
        permissions: this.permissions,
        socialLinks: this.socialLinks,
        preferences: this.preferences,
    }
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    })
}

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
    const payload = {
        id: this._id,
        role: this.role,
        email: this.email,
        fullname: this.fullname,
        avatar: this.avatar,
        coverImage: this.coverImage,
        age: this.age,
        gender: this.gender,
        organizationId: this.organizationId,
        phone: this.phone,
        address: this.address,
        status: this.status,
        dateOfBirth: this.dateOfBirth,
        biography: this.biography,
        permissions: this.permissions,
        socialLinks: this.socialLinks,
        preferences: this.preferences,
    }
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    })
}

userSchema.plugin(mongooseAggregatePaginate)

export const User = mongoose.model('User', userSchema);