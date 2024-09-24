import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const lessonSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        },
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
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
        // subjectId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Subject'
        // },
        // courseId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Course'
        // },
        // lesson: [
        //     {
        //         lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        //         description: { type: String },
        //         dueDate: { type: Date }
        //     }
        // ],
    },
    {
        timestamps: true
    }
);
lessonSchema.plugin(mongooseAggregatePaginate)
export const Lesson = mongoose.model('Lesson', lessonSchema);