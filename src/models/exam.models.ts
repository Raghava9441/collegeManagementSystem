//create exam model

import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const examSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        },
        duration: {
            type: Number,
            required: true
        },
        totalMarks: {
            type: Number,
            required: true
        },
        examType: {
            type: String,
            enum: ['quiz', 'midterm', 'final'],
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

    },
    {
        timestamps: true
    }
);
examSchema.plugin(mongooseAggregatePaginate)
export const Exam = mongoose.model('Exam', examSchema);