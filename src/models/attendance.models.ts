import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

interface IAttendance extends Document {
    classId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    date: Date;
    status: 'present' | 'absent' | 'excused';
    remarks?: string;
    markedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const attendanceSchema = new Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        // subjectId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Subject',
        //     required: true
        // },
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'excused'],
            required: true
        },
        remarks: {
            type: String,
            trim: true
        },
        markedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);
attendanceSchema.plugin(mongooseAggregatePaginate)
export const Attendance = mongoose.model('Attendance', attendanceSchema);