import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


interface IParent extends Document {
    _id: string;
    userId: mongoose.Types.ObjectId;
    childrenIds: mongoose.Types.ObjectId[];
    organizationId: string;
    dateOfBirth: Date;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
    };
    phoneNumber: string;
    email: string;
    occupation?: string;
    relationshipToStudent: string;
    emergencyContacts: Array<{
        name: string;
        relationship: string;
        phone: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const parentSchema = new Schema(
    {

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        childrenIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }],
        organizationId: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        address: {
            street: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            postalCode: {
                type: String,
                required: true,
                trim: true
            }
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        occupation: {
            type: String,
            trim: true
        },
        relationshipToStudent: {
            type: String,
            required: true,
            trim: true
        },
        emergencyContacts: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            relationship: {
                type: String,
                required: true,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                trim: true
            }
        }]
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);
parentSchema.plugin(mongooseAggregatePaginate)

export const Parent = mongoose.model('Parent', parentSchema);