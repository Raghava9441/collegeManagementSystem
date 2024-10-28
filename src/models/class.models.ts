import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
export interface IClass extends Document {
    _id: string;
    name: string;
    description: string;
    courseId: mongoose.Types.ObjectId;
    classTeacherId: mongoose.Types.ObjectId;
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
    supervisorId: mongoose.Types.ObjectId;
    academicYear: string;
    departmentId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    enrollStudent(studentId: mongoose.Types.ObjectId): Promise<IClass>;
}

const classSchema = new Schema(
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
        academicYear: {
            type: String,
            trim: true,
            required: true
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            // required: true
        },
        studentIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }],
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        classTeacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true
        },
        organizationId: {
            type: String,
            required: true
        },
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true
        }
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
classSchema.plugin(mongooseAggregatePaginate)
export const Class = mongoose.model('Class', classSchema);
