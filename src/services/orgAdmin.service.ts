import mongoose from 'mongoose';
import { Organization } from '../models/organization.models';
import { User } from '../models/user.models';
import { Student } from '../models/student.models';
import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.models';
import { Course } from '../models/course.models';
import { Exam } from '../models/exam.models';
import { Attendance } from '../models/attendance.models';
import { Department } from '../models/Department.models';
import Events from '../models/events.models';
import { ApiError } from '../utils/ApiError';
import { getMongoosePaginationOptions } from '../utils/healpers';

interface PaginationOptions {
    page: number;
    limit: number;
}

interface DateRange {
    startDate: Date;
    endDate: Date;
}

class OrgAdminService {
    /**
     * Get organization dashboard overview
     */
    async getOrgDashboard(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Verify organization exists
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            throw new ApiError(404, "Organization not found");
        }

        // Get all counts in parallel
        const [
            totalUsers,
            totalStudents,
            totalTeachers,
            totalClasses,
            totalCourses,
            totalDepartments,
            activeUsers,
            inactiveUsers
        ] = await Promise.all([
            User.countDocuments({ organizationId: orgId }),
            Student.countDocuments({ organizationId: orgId }),
            Teacher.countDocuments({ organizationId: orgId }),
            Class.countDocuments({ organizationId: orgId }),
            Course.countDocuments({ organizationId: orgId }),
            Department.countDocuments({ organizationId: orgId }),
            User.countDocuments({ organizationId: orgId, isActive: true }),
            User.countDocuments({ organizationId: orgId, isActive: false })
        ]);

        // Get gender distribution
        const genderStats = await User.aggregate([
            { $match: { organizationId: orgId, role: 'STUDENT' } },
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        // Get today's attendance summary
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await Attendance.aggregate([
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            { $unwind: '$class' },
            {
                $match: {
                    'class.organizationId': orgId,
                    date: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get upcoming exams (next 7 days) - filtered by organization
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const orgClasses = await Class.find({ organizationId: orgId }).select('_id');
        const classIds = orgClasses.map(c => c._id);

        const upcomingExams = await Exam.find({
            startDate: { $gte: new Date(), $lte: nextWeek },
            classId: { $in: classIds }
        })
            .populate('classId', 'name')
            .populate('courseId', 'name')
            .populate('teacherId', 'firstName lastName')
            .limit(5)
            .lean();

        // Get recent events - filtered by organization
        const recentEvents = await Events.find({
            date: { $gte: today },
            organizationId: organizationId
        })
            .sort({ date: 1 })
            .limit(5)
            .populate('organizer', 'fullname');

        return {
            role: 'ORGADMIN',
            organization: {
                id: organization._id,
                name: organization.name,
                category: organization.category,
                contactEmail: organization.contactEmail,
                logo: organization.logo
            },
            summary: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalClasses,
                totalCourses,
                totalDepartments,
                activeUsers,
                inactiveUsers
            },
            genderDistribution: genderStats.reduce((acc, curr) => {
                acc[curr._id || 'unknown'] = curr.count;
                return acc;
            }, {}),
            todayAttendance: {
                present: todayAttendance.find(a => a._id === 'present')?.count || 0,
                absent: todayAttendance.find(a => a._id === 'absent')?.count || 0,
                excused: todayAttendance.find(a => a._id === 'excused')?.count || 0
            },
            upcomingExams,
            recentEvents,
            lastUpdated: new Date()
        };
    }

    /**
     * Get organization's user management data
     */
    async getOrgUsers(organizationId: string, paginationOptions: PaginationOptions, filters?: { role?: string; isActive?: boolean; search?: string }): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);
        const { page, limit } = paginationOptions;

        const matchStage: any = { organizationId: orgId };

        if (filters?.role) {
            matchStage.role = filters.role;
        }
        if (filters?.isActive !== undefined) {
            matchStage.isActive = filters.isActive;
        }
        if (filters?.search) {
            matchStage.$or = [
                { fullname: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const userAggregate = User.aggregate([
            { $match: matchStage },
            {
                $project: {
                    fullname: 1,
                    email: 1,
                    role: 1,
                    isActive: 1,
                    gender: 1,
                    phone: 1,
                    createdAt: 1,
                    lastLogin: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const users = await User.aggregatePaginate(
            userAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalUsers",
                    docs: "users",
                },
            })
        );

        // Get role distribution
        const roleStats = await User.aggregate([
            { $match: { organizationId: orgId } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        return {
            ...users,
            roleDistribution: roleStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };
    }

    /**
     * Get organization's student analytics
     */
    async getOrgStudentAnalytics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Total students
        const totalStudents = await Student.countDocuments({ organizationId: orgId });

        // Students by class
        const studentsByClass = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $project: {
                    name: 1,
                    academicYear: 1,
                    currentEnrollment: 1,
                    maxCapacity: 1,
                    studentCount: { $size: { $ifNull: ['$studentIds', []] } }
                }
            },
            { $sort: { name: 1 } }
        ]);

        // Students by department
        const studentsByDepartment = await Student.aggregate([
            { $match: { organizationId: orgId } },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$class.departmentId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } }
        ]);

        // New students this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newStudentsThisMonth = await Student.countDocuments({
            organizationId: orgId,
            createdAt: { $gte: startOfMonth }
        });

        // Gender distribution
        const genderDistribution = await Student.aggregate([
            { $match: { organizationId: orgId } },
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        return {
            totalStudents,
            newStudentsThisMonth,
            studentsByClass,
            studentsByDepartment,
            genderDistribution: genderDistribution.reduce((acc, curr) => {
                acc[curr._id || 'unknown'] = curr.count;
                return acc;
            }, {})
        };
    }

    /**
     * Get organization's teacher analytics
     */
    async getOrgTeacherAnalytics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Total teachers
        const totalTeachers = await Teacher.countDocuments({ organizationId: orgId });

        // Teachers by department
        const teachersByDepartment = await Teacher.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: '$departmentId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } }
        ]);

        // Teachers with their class count
        const teacherWorkload = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: '$classTeacherId',
                    classCount: { $sum: 1 },
                    totalStudents: { $sum: '$currentEnrollment' }
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    teacherName: { $concat: ['$teacher.firstName', ' ', '$teacher.lastName'] },
                    classCount: 1,
                    totalStudents: 1
                }
            },
            { $sort: { classCount: -1 } }
        ]);

        return {
            totalTeachers,
            teachersByDepartment,
            teacherWorkload
        };
    }

    /**
     * Get organization's attendance analytics
     */
    async getOrgAttendanceAnalytics(organizationId: string, dateRange?: DateRange): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);
        const startDate = dateRange?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
        const endDate = dateRange?.endDate || new Date();

        // Get classes for this organization
        const orgClasses = await Class.find({ organizationId: orgId }).select('_id');
        const classIds = orgClasses.map(c => c._id);

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

        // Daily trend
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
                    },
                    total: { $sum: '$count' }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
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
                    },
                    total: { $sum: '$count' }
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
            { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    className: '$classInfo.name',
                    stats: 1,
                    total: 1,
                    attendanceRate: {
                        $multiply: [
                            {
                                $divide: [
                                    {
                                        $sum: {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: '$stats',
                                                        cond: { $in: ['$$this.status', ['present', 'excused']] }
                                                    }
                                                },
                                                as: 's',
                                                in: '$$s.count'
                                            }
                                        }
                                    },
                                    '$total'
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { attendanceRate: -1 } }
        ]);

        // Low attendance students (below 75%)
        const lowAttendanceStudents = await Attendance.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$studentId',
                    total: { $sum: 1 },
                    present: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['present', 'excused']] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    total: 1,
                    present: 1,
                    attendanceRate: {
                        $multiply: [{ $divide: ['$present', '$total'] }, 100]
                    }
                }
            },
            { $match: { attendanceRate: { $lt: 75 } } },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
            { $sort: { attendanceRate: 1 } },
            { $limit: 20 }
        ]);

        const totalRecords = overallStats.reduce((acc, curr) => acc + curr.count, 0);
        const presentCount = overallStats.find(s => s._id === 'present')?.count || 0;
        const excusedCount = overallStats.find(s => s._id === 'excused')?.count || 0;

        return {
            summary: {
                totalRecords,
                present: presentCount,
                absent: overallStats.find(s => s._id === 'absent')?.count || 0,
                excused: excusedCount,
                attendanceRate: totalRecords > 0 
                    ? ((presentCount + excusedCount) / totalRecords * 100).toFixed(2) + '%' 
                    : '0%'
            },
            dailyTrend,
            byClass,
            lowAttendanceStudents,
            dateRange: { startDate, endDate }
        };
    }

    /**
     * Get organization's class analytics
     */
    async getOrgClassAnalytics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Total classes
        const totalClasses = await Class.countDocuments({ organizationId: orgId });

        // Capacity utilization
        const capacityStats = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: null,
                    totalCapacity: { $sum: '$maxCapacity' },
                    totalEnrolled: { $sum: '$currentEnrollment' },
                    avgCapacity: { $avg: '$maxCapacity' },
                    avgEnrollment: { $avg: '$currentEnrollment' }
                }
            }
        ]);

        // Classes by department
        const byDepartment = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: '$departmentId',
                    count: { $sum: 1 },
                    totalStudents: { $sum: '$currentEnrollment' }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } }
        ]);

        // Classes by academic year
        const byAcademicYear = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: '$academicYear',
                    count: { $sum: 1 },
                    totalStudents: { $sum: '$currentEnrollment' }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        // Classes with low enrollment (below 50%)
        const lowEnrollmentClasses = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $project: {
                    name: 1,
                    academicYear: 1,
                    maxCapacity: 1,
                    currentEnrollment: 1,
                    utilizationRate: {
                        $multiply: [
                            { $divide: ['$currentEnrollment', '$maxCapacity'] },
                            100
                        ]
                    }
                }
            },
            { $match: { utilizationRate: { $lt: 50 } } },
            { $sort: { utilizationRate: 1 } }
        ]);

        // Classes at full capacity
        const fullClasses = await Class.find({
            organizationId: orgId,
            $expr: { $gte: ['$currentEnrollment', '$maxCapacity'] }
        }).select('name academicYear maxCapacity currentEnrollment');

        return {
            totalClasses,
            capacityStats: capacityStats[0] || {
                totalCapacity: 0,
                totalEnrolled: 0,
                avgCapacity: 0,
                avgEnrollment: 0
            },
            utilizationRate: capacityStats[0]?.totalCapacity > 0
                ? ((capacityStats[0].totalEnrolled / capacityStats[0].totalCapacity) * 100).toFixed(2) + '%'
                : '0%',
            byDepartment,
            byAcademicYear,
            lowEnrollmentClasses,
            fullClasses
        };
    }

    /**
     * Get organization's exam analytics
     */
    async getOrgExamAnalytics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Get classes for this organization
        const orgClasses = await Class.find({ organizationId: orgId }).select('_id');
        const classIds = orgClasses.map(c => c._id);

        // Total exams
        const totalExams = await Exam.countDocuments({ classId: { $in: classIds } });

        // Exams by type
        const byType = await Exam.aggregate([
            { $match: { classId: { $in: classIds } } },
            {
                $group: {
                    _id: '$examType',
                    count: { $sum: 1 },
                    avgDuration: { $avg: '$duration' },
                    avgTotalMarks: { $avg: '$totalMarks' }
                }
            }
        ]);

        // Upcoming exams
        const upcomingExams = await Exam.find({
            classId: { $in: classIds },
            startDate: { $gt: new Date() }
        })
            .sort({ startDate: 1 })
            .limit(10)
            .populate('classId', 'name')
            .populate('courseId', 'name')
            .populate('teacherId', 'firstName lastName');

        // Recent completed exams
        const recentExams = await Exam.find({
            classId: { $in: classIds },
            endDate: { $lt: new Date() }
        })
            .sort({ endDate: -1 })
            .limit(10)
            .populate('classId', 'name')
            .populate('courseId', 'name');

        // Exams by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const examsByMonth = await Exam.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    startDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startDate' },
                        month: { $month: '$startDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return {
            totalExams,
            byType,
            upcomingExams,
            recentExams,
            examsByMonth
        };
    }

    /**
     * Get organization's course analytics
     */
    async getOrgCourseAnalytics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Total courses
        const totalCourses = await Course.countDocuments({ organizationId: orgId });

        // Courses by department
        const byDepartment = await Course.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: '$departmentId',
                    count: { $sum: 1 },
                    totalCredits: { $sum: '$credits' }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } }
        ]);

        // Course status
        const now = new Date();
        const [activeCourses, upcomingCourses, completedCourses] = await Promise.all([
            Course.countDocuments({
                organizationId: orgId,
                startDate: { $lte: now },
                endDate: { $gte: now }
            }),
            Course.countDocuments({
                organizationId: orgId,
                startDate: { $gt: now }
            }),
            Course.countDocuments({
                organizationId: orgId,
                endDate: { $lt: now }
            })
        ]);

        // Popular courses by enrollment
        const popularCourses = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: '$courseId',
                    totalEnrollment: { $sum: '$currentEnrollment' },
                    classCount: { $sum: 1 }
                }
            },
            { $sort: { totalEnrollment: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } }
        ]);

        return {
            totalCourses,
            courseStatus: {
                active: activeCourses,
                upcoming: upcomingCourses,
                completed: completedCourses
            },
            byDepartment,
            popularCourses
        };
    }

    /**
     * Get organization's department analytics
     */
    async getOrgDepartmentAnalytics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Get all departments with stats
        const departmentStats = await Department.aggregate([
            { $match: { organizationId: orgId } },
            {
                $lookup: {
                    from: 'teachers',
                    localField: '_id',
                    foreignField: 'departmentId',
                    as: 'teachers'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'departmentId',
                    as: 'courses'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: '_id',
                    foreignField: 'departmentId',
                    as: 'classes'
                }
            },
            {
                $project: {
                    name: 1,
                    code: 1,
                    teacherCount: { $size: '$teachers' },
                    courseCount: { $size: '$courses' },
                    classCount: { $size: '$classes' },
                    totalStudents: { $sum: '$classes.currentEnrollment' }
                }
            },
            { $sort: { name: 1 } }
        ]);

        const totalDepartments = await Department.countDocuments({ organizationId: orgId });

        return {
            totalDepartments,
            departments: departmentStats
        };
    }

    /**
     * Get organization's recent activities
     */
    async getOrgRecentActivities(organizationId: string, limit: number = 20): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Recent users
        const recentUsers = await User.find({ organizationId: orgId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullname email role createdAt')
            .lean();

        // Recent classes
        const recentClasses = await Class.find({ organizationId: orgId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name academicYear createdAt')
            .lean();

        // Recent attendance records
        const orgClasses = await Class.find({ organizationId: orgId }).select('_id');
        const classIds = orgClasses.map(c => c._id);

        const recentAttendance = await Attendance.find({ classId: { $in: classIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('studentId', 'firstName lastName')
            .populate('classId', 'name')
            .lean();

        // Combine and sort activities
        const activities = [
            ...recentUsers.map(u => ({ type: 'user_created', data: u, timestamp: u.createdAt })),
            ...recentClasses.map(c => ({ type: 'class_created', data: c, timestamp: c.createdAt })),
            ...recentAttendance.map(a => ({ type: 'attendance_marked', data: a, timestamp: a.createdAt }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

        return activities;
    }

    /**
     * Get organization's performance metrics
     */
    async getOrgPerformanceMetrics(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        // Get classes for this organization
        const orgClasses = await Class.find({ organizationId: orgId }).select('_id');
        const classIds = orgClasses.map(c => c._id);

        // Calculate overall attendance rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    classId: { $in: classIds },
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    excused: {
                        $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Class utilization
        const classUtilization = await Class.aggregate([
            { $match: { organizationId: orgId } },
            {
                $group: {
                    _id: null,
                    totalCapacity: { $sum: '$maxCapacity' },
                    totalEnrolled: { $sum: '$currentEnrollment' }
                }
            }
        ]);

        // Growth metrics (compare with last month)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [currentStudents, lastMonthStudents] = await Promise.all([
            Student.countDocuments({ organizationId: orgId }),
            Student.countDocuments({
                organizationId: orgId,
                createdAt: { $lt: lastMonth }
            })
        ]);

        const studentGrowth = lastMonthStudents > 0
            ? ((currentStudents - lastMonthStudents) / lastMonthStudents * 100).toFixed(2)
            : '100';

        const stats = attendanceStats[0] || { total: 0, present: 0, excused: 0 };
        const utilization = classUtilization[0] || { totalCapacity: 0, totalEnrolled: 0 };

        return {
            attendanceRate: stats.total > 0
                ? ((stats.present + stats.excused) / stats.total * 100).toFixed(2) + '%'
                : '0%',
            classUtilization: utilization.totalCapacity > 0
                ? ((utilization.totalEnrolled / utilization.totalCapacity) * 100).toFixed(2) + '%'
                : '0%',
            studentGrowth: studentGrowth + '%',
            metrics: {
                totalStudents: currentStudents,
                totalCapacity: utilization.totalCapacity,
                totalEnrolled: utilization.totalEnrolled,
                attendanceRecords: stats.total
            }
        };
    }
}

export const orgAdminService = new OrgAdminService();
