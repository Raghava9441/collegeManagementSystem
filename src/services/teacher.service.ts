import { TeacherDashboard, TeacherDashboardData } from '../models/dashBoard.modals';
import GenericService from './generic.service';
import { User } from '../models/user.models';
import Events from '../models/events.models';
import { Organization } from '../models/organization.models';
import { Student } from '../models/student.models';
import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.models';
import { Course } from '../models/course.models';
import { Attendance } from '../models/attendance.models';
import { Department } from '../models/Department.models';
import { Subject } from '../models/subject.models';
import mongoose from 'mongoose';

class TeacherService {
    private teacherService: GenericService<any, any>;

    constructor() {
        this.teacherService = new GenericService<any, any>(TeacherDashboard);
    }

    /**
     * Get teacher dashboard with comprehensive analytics
     */
    async getTeacherDashboard(teacherId: string, date?: string): Promise<TeacherDashboardData> {
        // Get teacher details
        const teacher = await Teacher.findById(teacherId).populate('userId', 'fullname email avatar').populate('departments', 'name').populate('subjects', 'name');
        if (!teacher) {
            throw new Error('Teacher not found');
        }

        const user = await User.findById(teacher.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get organization details
        const organization = await Organization.findById(teacher.organizationId);

        // Get current month and year for attendance stats
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // Get attendance statistics for the teacher's classes
        const classes = await Class.find({ classTeacherId: teacherId });
        const classIds = classes.map(cls => cls._id);

        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const presentCount = attendanceStats.find(s => s._id === 'present')?.count || 0;
        const absentCount = attendanceStats.find(s => s._id === 'absent')?.count || 0;

        // Get teaching statistics
        const totalClasses = classes.length;
        const coursesTaught = await Course.find({ teacherIds: teacherId });
        const totalCourses = coursesTaught.length;
        
        // Get total students in all classes taught by this teacher
        const totalStudents = classes.reduce((sum, cls) => sum + cls.currentEnrollment, 0);

        // Get lessons/assignments count (assuming lessons are part of courses)
        const totalLessons = coursesTaught.reduce((sum, course) => sum + (course.assignments?.length || 0), 0);

        // Get schedule
        const schedule = this.buildTeacherSchedule(classes);

        // Get courses details
        const courseDetails: any[] = [];
        for (const course of coursesTaught) {
            const courseClasses = await Class.find({ courseId: course._id });
            const maxCapacity = courseClasses.reduce((sum, cls) => sum + cls.maxCapacity, 0);
            courseDetails.push({
                courseId: course._id.toString(),
                name: course.name,
                code: course.code,
                description: course.description,
                credits: course.credits || 3,
                startDate: course.startDate,
                endDate: course.endDate,
                schedule: course.schedule,
                currentEnrollment: course.studentsEnrolled.length,
                maxCapacity
            });
        }

        // Get upcoming events
        const startDate = date ? new Date(date) : new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7); // 7-day view

        const upcomingEvents = await Events.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).populate('organizer', 'fullname').limit(10);

        const events = upcomingEvents.map(event => ({
            title: event.title,
            description: event.description,
            organizer: {
                id: event.organizer?._id?.toString() || '',
                name: (event.organizer as any)?.fullname || 'Unknown'
            },
            eventType: event.eventType
        }));

        return {
            role: 'teacher',
            teacherInfo: {
                id: teacher._id.toString(),
                name: user.fullname,
                image: user.avatar || '',
                email: user.email,
                department: teacher.departments[0]?.name || 'Unknown',
                designation: 'Teacher',
                qualifications: teacher.qualifications?.join(', ') || '',
                experience: teacher.experience,
                officeHours: teacher.officeHours
            },
            attendance: {
                presentCount,
                absentCount,
                month: currentMonth,
                year: currentYear
            },
            teachingStats: {
                totalLessons,
                totalClasses,
                coursesTaught: totalCourses,
                totalStudents
            },
            schedule,
            courses: courseDetails
        };
    }

    /**
     * Build teacher schedule from classes
     */
    private buildTeacherSchedule(classes: any[]): any[] {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const schedule: any[] = [];

        daysOfWeek.forEach(day => {
            const dayClasses = classes.filter(cls => 
                cls.schedule.some((s: any) => s.dayOfWeek === day)
            ).map(cls => {
                const classSchedule = cls.schedule.find((s: any) => s.dayOfWeek === day);
                return {
                    classId: cls._id.toString(),
                    courseId: cls.courseId.toString(),
                    courseName: cls.name,
                    startTime: classSchedule.startTime,
                    endTime: classSchedule.endTime,
                    classroom: cls.classroom,
                    subject: '', // Could be fetched from course details
                    studentCount: cls.currentEnrollment,
                    maxCapacity: cls.maxCapacity,
                    academicYear: cls.academicYear
                };
            }).sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (dayClasses.length > 0) {
                schedule.push({
                    dayOfWeek: day,
                    classes: dayClasses
                });
            }
        });

        return schedule;
    }

    /**
     * Get attendance analytics for teacher's classes
     */
    async getAttendanceAnalytics(teacherId: string, dateRange?: { startDate: Date; endDate: Date }): Promise<any> {
        const startDate = dateRange?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
        const endDate = dateRange?.endDate || new Date();

        const classes = await Class.find({ classTeacherId: teacherId });
        const classIds = classes.map(cls => cls._id);

        // Overall attendance stats
        const overallStats = await Attendance.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Daily attendance trend
        const dailyTrend = await Attendance.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    stats: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Attendance by class
        const byClass = await Attendance.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { classId: '$classId', status: '$status' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.classId',
                    stats: {
                        $push: {
                            status: '$_id.status',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'classInfo'
                }
            },
            {
                $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true }
            }
        ]);

        const totalRecords = overallStats.reduce((acc, curr) => acc + curr.count, 0);
        const presentCount = overallStats.find(s => s._id === 'present')?.count || 0;
        const absentCount = overallStats.find(s => s._id === 'absent')?.count || 0;
        const excusedCount = overallStats.find(s => s._id === 'excused')?.count || 0;

        return {
            summary: {
                totalRecords,
                presentCount,
                absentCount,
                excusedCount,
                attendanceRate: totalRecords > 0 ? ((presentCount + excusedCount) / totalRecords * 100).toFixed(2) + '%' : '0%'
            },
            dailyTrend,
            byClass,
            dateRange: { startDate, endDate }
        };
    }

    /**
     * Get student performance analytics
     */
    async getStudentPerformanceAnalytics(teacherId: string): Promise<any> {
        const classes = await Class.find({ classTeacherId: teacherId });
        const classIds = classes.map(cls => cls._id);

        // Get all students in teacher's classes
        const students = await Student.find({
            _id: { $in: classes.flatMap(cls => cls.studentIds) }
        }).populate('userId', 'fullname email');

        // TODO: Add performance metrics based on grades/results

        return {
            totalStudents: students.length,
            classPerformance: classes.map(cls => ({
                classId: cls._id.toString(),
                className: cls.name,
                studentCount: cls.currentEnrollment,
                averageAttendance: '95%', // TODO: Calculate actual average
                averageGrade: 'B+', // TODO: Calculate actual average
                topPerformers: [], // TODO: Get top performing students
                atRiskStudents: [] // TODO: Get students at risk
            }))
        };
    }

    /**
     * Get course analytics for teacher
     */
    async getCourseAnalytics(teacherId: string): Promise<any> {
        const courses = await Course.find({ teacherIds: teacherId }).populate('teacherIds');

        return courses.map(course => ({
            courseId: course._id.toString(),
            name: course.name,
            code: course.code,
            description: course.description,
            credits: course.credits || 3,
            enrollment: course.studentsEnrolled.length,
            assignments: course.assignments?.length || 0,
            feedbackCount: course.feedback?.length || 0,
            averageRating: course.feedback?.length > 0 
                ? (course.feedback.reduce((sum, f) => sum + f.rating, 0) / course.feedback.length).toFixed(1) 
                : 'N/A',
            resources: course.resources?.length || 0
        }));
    }
}

export default TeacherService;
