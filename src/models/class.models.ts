import mongoose, { Schema, Document, Model } from 'mongoose';

interface IClass extends Document {
    _id: string;
    name: string;
    description: string;
    courseId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    studentIds: mongoose.Types.ObjectId[];
    organizationId: string;
    schedule: Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    }>;
    classroom: string;
    credits: number;
    maxCapacity: number;
    currentEnrollment: number;
    createdAt: Date;
    updatedAt: Date;
    enrollStudent(studentId: mongoose.Types.ObjectId): Promise<IClass>;
}

const classSchema = new Schema<IClass>(
    {
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true
        },
        studentIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }],
        organizationId: {
            type: String,
            required: true
        },
        schedule: [{
            dayOfWeek: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                required: true
            },
            startTime: {
                type: String, // e.g., "10:00 AM"
                required: true
            },
            endTime: {
                type: String, // e.g., "12:00 PM"
                required: true
            }
        }],
        classroom: {
            type: String, // e.g., "Room 101"
            trim: true
        },
        credits: {
            type: Number,
            default: 3
        },
        maxCapacity: {
            type: Number,
            default: 30
        },
        currentEnrollment: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
);

classSchema.methods.enrollStudent = function (this: IClass, studentId: mongoose.Types.ObjectId): Promise<IClass> {
    if (this.studentIds.includes(studentId)) {
        throw new Error('Student is already enrolled in this class.');
    }
    if (this.currentEnrollment >= this.maxCapacity) {
        throw new Error('Class is at maximum capacity.');
    }
    this.studentIds.push(studentId);
    this.currentEnrollment += 1;
    return this.save();
};

export const Class: Model<IClass> = mongoose.model<IClass>('Class', classSchema);
