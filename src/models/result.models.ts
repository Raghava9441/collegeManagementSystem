//create result model

import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const resultSchema = new Schema(
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
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        academicYear: { type: String, required: true },
        grades: [{ type: Schema.Types.ObjectId, ref: 'Grade' }],
        totalScore: { type: Number, required: true },
        averageScore: { type: Number, required: true },
        rank: { type: Number },
        status: { type: String, enum: ['pass', 'fail', 'incomplete'], required: true },
        // dueDate: { type: Date, required: true },
        // subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        // class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        // teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        duration: {
            type: Number,
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
    },
    {
        timestamps: true
    }
);
resultSchema.plugin(mongooseAggregatePaginate)
export const Result = mongoose.model('Result', resultSchema);