// name string
// category string
// number string
// address string
// createdBy string fk
// createdAt date
// updatedAt date



import mongoose, { Schema } from 'mongoose';

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        number: {
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        logo: {
            type: String, // cloudinary URL or other storage service URL
        },
        website: {
            type: String
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        contactPhone: {
            type: String,
            trim: true
        },
        establishedDate: {
            type: Date
        },
        description: {
            type: String
        },
        socialLinks: {
            facebook: { type: String },
            twitter: { type: String },
            linkedin: { type: String },
            instagram: { type: String }
        },
    },
    {
        timestamps: true
    }
);

export const Organization = mongoose.model('Organization', organizationSchema);
