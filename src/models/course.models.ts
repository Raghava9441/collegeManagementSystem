


import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
export interface ICourse extends Document {
    subjectsIds: string[]; // Array of subject IDs
    department?: string; // Optional department field
    teacherIds: mongoose.Schema.Types.ObjectId[]; // Array of ObjectId references to Teacher
    studentsEnrolled: mongoose.Schema.Types.ObjectId[]; // Array of ObjectId references to Student
    organizationId: mongoose.Schema.Types.ObjectId; // Reference to Organization
    name: string; // Course name
    code: string; // Unique course code
    description?: string; // Optional course description
    startDate: Date; // Start date of the course
    endDate: Date; // End date of the course
    schedule?: string; // Optional schedule description
    credits?: number; // Optional credits, default is 3
    prerequisites?: string[]; // Optional array of prerequisites
    location?: string; // Optional location
    fee?: number; // Optional fee, default is 0
    textbooks?: {
        title: string;
        author: string;
        ISBN: string;
    }; // Array of textbooks
    syllabus?: string; // Optional syllabus
    assignments?: {
        title: string;
        description: string;
        dueDate: Date;
    }[]; // Array of assignments
    gradingScheme?: string; // Optional grading scheme
    feedback?: {
        studentId: mongoose.Schema.Types.ObjectId; // Reference to User
        comment: string;
        rating: number; // Rating between 1 and 5
    }[]; // Array of feedback
    resources?: {
        title: string;
        url: string;
    }[]; // Array of resources

}
export type ICourseAggregateModel = mongoose.AggregatePaginateModel<ICourse> & Model<ICourse>;



const courseSchema = new Schema(
    {
        // academicYear: { type: String, required: true },
        subjectsIds: [{ type: String, ref: 'Subject' }],
        department: { type: String },
        teacherIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            // required: true
        }],
        studentsEnrolled: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }],
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: { type: String, required: true, unique: true },
        description: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        schedule: {
            type: String, // e.g., "Monday, Wednesday, Friday 10:00 AM - 12:00 PM"
            trim: true
        },
        credits: {
            type: Number,
            default: 3
        },
        prerequisites: {
            type: [String],
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        fee: {
            type: Number,
            default: 0
        },
        textbooks: [{
            title: { type: String },
            author: { type: String },
            ISBN: { type: String }
        }],
        syllabus: {
            type: String
        },
        assignments: [{
            title: { type: String },
            description: { type: String },
            dueDate: { type: Date }
        }],
        gradingScheme: {
            type: String
        },
        feedback: [{
            studentId: { type: String, ref: 'User' },
            comment: { type: String },
            rating: { type: Number, min: 1, max: 5 }
        }],
        resources: [{
            title: { type: String },
            url: { type: String }
        }],
    },
    {
        timestamps: true
    }
);
courseSchema.plugin(mongooseAggregatePaginate)
export const Course = mongoose.model('Course', courseSchema);
// export const Course = mongoose.model<ICourse, ICourseAggregateModel>('Course', courseSchema);