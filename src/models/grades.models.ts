import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IGrade extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    assignment: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    exam: mongoose.Types.ObjectId;
    score: number;
    remarks?: string;
    gradedBy: mongoose.Types.ObjectId;
    grade: number;
    feedback?: string; // Optional
    dateAssigned: Date;
    dateGraded?: Date; // Optional
    createdAt: Date;
    updatedAt: Date;
}

const gradeSchema = new Schema<IGrade>(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' },
        score: { type: Number, required: true },
        remarks: { type: String },
        gradedBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        grade: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        feedback: {
            type: String,
            trim: true
        },
        dateAssigned: {
            type: Date,
            required: true
        },
        dateGraded: {
            type: Date
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);
gradeSchema.plugin(mongooseAggregatePaginate)
export const Grade: Model<IGrade> = mongoose.model<IGrade>('Grade', gradeSchema);

