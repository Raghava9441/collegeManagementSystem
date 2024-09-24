


import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const courseSchema = new Schema(
    {
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
        academicYear: { type: String, required: true },
        subjectsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
        department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            // required: true
        },
        organizationId: {
            type: String,
            required: true
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
        studentsEnrolled: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }],
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
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
