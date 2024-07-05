// firstname string
// lastname string
// email string
// role enum ['admin', 'teacher', 'student', 'parent']
// password string
// age int
// gender enum ['male', 'female', 'other']
// organizationId string fk

import mongoose, { Schema } from 'mongoose';

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

export const User = mongoose.model("User", userSchema);