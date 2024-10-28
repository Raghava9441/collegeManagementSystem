//create subject model

import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const subjectSchema = new Schema(
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
        teacherIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }],
        classId: { type: Schema.Types.ObjectId, ref: 'Class' },
        organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        studentsEnrolled: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
        lesson: [
            {
                lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
                description: { type: String },
                dueDate: { type: Date }
            }
        ],
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
subjectSchema.plugin(mongooseAggregatePaginate)
export const Subject = mongoose.model('Subject', subjectSchema);
