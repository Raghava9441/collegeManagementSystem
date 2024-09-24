//create assignment model

import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const assignmentSchema = new Schema(
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
        dueDate: { type: Date, required: true },
        subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        totalMarks: { type: Number, required: true },
        // subjectId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Subject'
        // },
        // courseId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Course'
        // },
        // classId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Class'
        // },
        // teacherId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Teacher'
        // },
        // lesson: [
        //     {
        //         lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        //         description: { type: String },
        //         dueDate: { type: Date }
        //     }
        // ],
        duration: {
            type: Number,
            required: true
        },
        // assignmentType: {
        //     type: String,
        //     enum: ['quiz', 'midterm', 'final'],
        //     required: true
        // },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
    },
    {
        timestamps: true
    }
);
assignmentSchema.plugin(mongooseAggregatePaginate)
export const Assignment = mongoose.model('Assignment', assignmentSchema);