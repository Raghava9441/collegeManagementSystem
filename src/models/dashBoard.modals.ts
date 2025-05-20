// Common interfaces
interface BaseDashboardData {
    role: 'admin' | 'teacher';
}

// Admin Dashboard Data
interface AdminDashboardData extends BaseDashboardData {
    role: 'admin';
    counts: {
        adminCount: number;
        teacherCount: number;
        studentCount: number;
        parentCount: number;
    };
    studentStats: {
        maleCount: number;
        femaleCount: number;
    };
    attendanceStats: {
        presentCount: number;
        absentCount: number;
        year: number;
    };
    events: Array<{
        title: string;
        description?: string;
        organizer: {
            id: string;
            name: string;
        };
        eventType: 'workshop' | 'seminar' | 'meeting' | 'other';
    }>;
}

// Teacher Dashboard Data
interface TeacherDashboardData extends BaseDashboardData {
    role: 'teacher';
    teacherInfo: {
        id: string;
        name: string;
        image: string;
        email: string;
        department: string;
        designation: string;
        qualifications?: string;
        experience?: number;
        officeHours?: string;
    };
    attendance: {
        presentCount: number;
        absentCount: number;
        month: number;
        year: number;
    };
    teachingStats: {
        totalLessons: number;
        totalClasses: number;
        coursesTaught: number;
        totalStudents: number;
    };
    schedule: {
        dayOfWeek: string;
        classes: Array<{
            classId: string;
            courseId: string;
            courseName: string;
            startTime: string;
            endTime: string;
            classroom: string;
            subject: string;
            studentCount: number;
            maxCapacity: number;
            academicYear: string;
        }>;
    }[];
    courses: Array<{
        courseId: string;
        name: string;
        code: string;
        description?: string;
        credits: number;
        startDate: Date;
        endDate: Date;
        schedule?: string;
        currentEnrollment: number;
        maxCapacity: number;
    }>;
}

// Union type for all dashboard data
type DashboardData = AdminDashboardData | TeacherDashboardData;

// Mongoose Models
import mongoose, { Schema, Document } from 'mongoose';

// Admin Dashboard Schema
const adminDashboardSchema = new Schema({
    role: { type: String, required: true, enum: ['admin'] },
    counts: {
        adminCount: { type: Number, required: true },
        teacherCount: { type: Number, required: true },
        studentCount: { type: Number, required: true },
        parentCount: { type: Number, required: true }
    },
    studentStats: {
        maleCount: { type: Number, required: true },
        femaleCount: { type: Number, required: true }
    },
    attendanceStats: {
        presentCount: { type: Number, required: true },
        absentCount: { type: Number, required: true },
        year: { type: Number, required: true }
    }
}, { timestamps: true });

// Teacher Dashboard Schema
const teacherDashboardSchema = new Schema({
    role: { type: String, required: true, enum: ['teacher'] },
    teacherInfo: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        email: { type: String, required: true },
        department: { type: String, required: true },
        designation: { type: String, required: true },
        qualifications: { type: String },
        experience: { type: Number },
        officeHours: { type: String }
    },
    attendance: {
        presentCount: { type: Number, required: true },
        absentCount: { type: Number, required: true },
        month: { type: Number, required: true },
        year: { type: Number, required: true }
    },
    teachingStats: {
        totalLessons: { type: Number, required: true },
        totalClasses: { type: Number, required: true },
        coursesTaught: { type: Number, required: true },
        totalStudents: { type: Number, required: true }
    },
    schedule: [{
        dayOfWeek: { 
            type: String, 
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        classes: [{
            classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
            courseName: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
            classroom: { type: String, required: true },
            subject: { type: String, required: true },
            studentCount: { type: Number, required: true },
            maxCapacity: { type: Number, required: true },
            academicYear: { type: String, required: true }
        }]
    }],
    courses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        name: { type: String, required: true },
        code: { type: String, required: true },
        description: { type: String },
        credits: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        schedule: { type: String },
        currentEnrollment: { type: Number, required: true },
        maxCapacity: { type: Number, required: true }
    }]
}, { timestamps: true });

// Create Mongoose Models
const AdminDashboard = mongoose.model<AdminDashboardData & Document>('AdminDashboard', adminDashboardSchema);
const TeacherDashboard = mongoose.model<TeacherDashboardData & Document>('TeacherDashboard', teacherDashboardSchema);

// Export the types and models
export type {
    BaseDashboardData,
    AdminDashboardData,
    TeacherDashboardData,
    DashboardData
};

export {
    AdminDashboard,
    TeacherDashboard
};
