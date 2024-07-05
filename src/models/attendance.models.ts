import mongoose, { Schema, Document, Model } from 'mongoose';

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

const attendanceSchema = new Schema<IAttendance>(
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

export const Attendance: Model<IAttendance> = mongoose.model<IAttendance>('Attendance', attendanceSchema);