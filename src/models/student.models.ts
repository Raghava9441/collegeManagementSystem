import mongoose, { Schema, Document, Model } from 'mongoose';

interface IStudent extends Document {
    _id: string;
    userId: mongoose.Types.ObjectId;
    teacherIds: mongoose.Types.ObjectId[];
    organizationId: string;
    parentId: mongoose.Types.ObjectId;
    courseIds: mongoose.Types.ObjectId[];
    dateOfBirth: Date;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
    };
    phoneNumber: string;
    email: string;
    emergencyContacts: Array<{
        name: string;
        relationship: string;
        phone: string;
    }>;
    enrollmentDate: Date;
    graduationDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
    {
        _id: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        teacherIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }],
        organizationId: {
            type: String,
            required: true
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Parent'
        },
        courseIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
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
        }],
        enrollmentDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        graduationDate: {
            type: Date,
        }
    },
    {
        timestamps: true // Add this line to enable timestamps
    }
);

const Student: Model<IStudent> = mongoose.model<IStudent>('Student', studentSchema);

export default Student;
