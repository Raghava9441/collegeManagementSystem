import { AdminDashboard, AdminDashboardData } from '../models/dashBoard.modals';
import GenericService from './generic.service';
import { User } from '../models/user.models';
import Events from '../models/events.models';
import { Organization } from '../models/organization.models';
import { Student } from '../models/student.models';
import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.models';
import { Course } from '../models/course.models';
import { Exam } from '../models/exam.models';
import { Attendance } from '../models/attendance.models';
import { Department } from '../models/Department.models';
import mongoose from 'mongoose';

interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

class AdminService {
    private adminService: GenericService<any, any>;

    constructor() {
        this.adminService = new GenericService<any, any>(AdminDashboard);
    }

    /**
     * Get main admin dashboard with overview statistics
     */
    async getAdminDashboard(date?: string, organizationId?: string): Promise<AdminDashboardData> {
        const orgFilter = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

        // Get counts for each role
        const [adminCount, teacherCount, studentCount, parentCount] = await Promise.all([
            User.countDocuments({ role: 'ADMIN', ...orgFilter }),
            User.countDocuments({ role: 'TEACHER', ...orgFilter }),
            User.countDocuments({ role: 'STUDENT', ...orgFilter }),
            User.countDocuments({ role: 'PARENT', ...orgFilter })
        ]);

        // Get student gender statistics
        const [maleCount, femaleCount] = await Promise.all([
            User.countDocuments({ role: 'STUDENT', gender: 'male', ...orgFilter }),
            User.countDocuments({ role: 'STUDENT', gender: 'female', ...orgFilter })
        ]);

        // Get current year's attendance stats
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        const attendanceStats = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear, $lte: endOfYear }
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

        // Get events for the specified date or current date
        const startDate = date ? new Date(date) : new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const dayEvents = await Events.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).populate('organizer', 'fullname').limit(10);

        const events = dayEvents.map(event => ({
            title: event.title,
            description: event.description,
            organizer: {
                id: event.organizer?._id?.toString() || '',
                name: (event.organizer as any)?.fullname || 'Unknown'
            },
            eventType: event.eventType
        }));

        return {
            role: 'admin',
            counts: {
                adminCount,
                teacherCount,
                studentCount,
                parentCount
            },
            studentStats: {
                maleCount,
                femaleCount
            },
            attendanceStats: {
                presentCount,
                absentCount,
                year: currentYear
            },
            events
        };
    }

    /**
     * Get comprehensive system overview
     */
    async getSystemOverview(organizationId?: string): Promise<any> {
        const orgFilter = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

        const [
            totalOrganizations,
            totalUsers,
            totalStudents,
            totalTeachers,
            totalClasses,
            totalCourses,
            totalExams,
            totalDepartments
        ] = await Promise.all([
            Organization.countDocuments(),
            User.countDocuments(orgFilter),
            Student.countDocuments(orgFilter),
            Teacher.countDocuments(orgFilter),
            Class.countDocuments(orgFilter),
            Course.countDocuments(orgFilter),
            Exam.countDocuments(),
            Department.countDocuments(orgFilter)
        ]);

        return {
            totalOrganizations,
            totalUsers,
            totalStudents,
            totalTeachers,
            totalClasses,
            totalCourses,
            totalExams,
            totalDepartments,
            lastUpdated: new Date()
        };
    }

    /**
     * Get user statistics by role
     */
    async getUserStatistics(organizationId?: string): Promise<any> {
        const orgFilter = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

        const usersByRole = await User.aggregate([
            { $match: orgFilter },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const usersByStatus = await User.aggregate([
            { $match: orgFilter },
            {
                $group: {
                    _id: '$isActive',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentUsers = await User.find(orgFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select('fullname email role createdAt isActive');

        return {
            byRole: usersByRole.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            byStatus: {
                active: usersByStatus.find(s => s._id === true)?.count || 0,
                inactive: usersByStatus.find(s => s._id === false)?.count || 0
            },
            recentUsers,
            totalUsers: usersByRole.reduce((acc, curr) => acc + curr.count, 0)
        };
    }

    /**
     * Get attendance analytics
     */
    async getAttendanceAnalytics(dateRange?: DateRange, organizationId?: string): Promise<any> {
        const startDate = dateRange?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
        const endDate = dateRange?.endDate || new Date();

        // Overall attendance stats
        const overallStats = await Attendance.aggregate([
            {
                $match: {
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
     * Get exam analytics
     */
    async getExamAnalytics(organizationId?: string): Promise<any> {
        const now = new Date();

        // Exams by type
        const examsByType = await Exam.aggregate([
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
        const upcomingExams = await Exam.find({ startDate: { $gt: now } })
            .sort({ startDate: 1 })
            .limit(10)
            .populate('courseId', 'name')
            .populate('classId', 'name')
            .populate('teacherId', 'firstName lastName');

        // Past exams (last 30 days)
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        const recentExams = await Exam.find({
            endDate: { $lt: new Date(), $gte: thirtyDaysAgo }
        })
            .sort({ endDate: -1 })
            .limit(10)
            .populate('courseId', 'name')
            .populate('classId', 'name');

        // Exams by month
        const examsByMonth = await Exam.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$startDate' },
                        month: { $month: '$startDate' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        return {
            byType: examsByType,
            upcomingExams,
            recentExams,
            examsByMonth,
            totalExams: await Exam.countDocuments()
        };
    }

    /**
     * Get class analytics
     */
    async getClassAnalytics(organizationId?: string): Promise<any> {
        const orgFilter = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

        // Classes by capacity utilization
        const capacityStats = await Class.aggregate([
            { $match: orgFilter },
            {
                $project: {
                    name: 1,
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
            {
                $bucket: {
                    groupBy: '$utilizationRate',
                    boundaries: [0, 25, 50, 75, 100, Infinity],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                        classes: { $push: '$name' }
                    }
                }
            }
        ]);

        // Classes by department
        const byDepartment = await Class.aggregate([
            { $match: orgFilter },
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
            {
                $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
            }
        ]);

        // Classes by academic year
        const byAcademicYear = await Class.aggregate([
            { $match: orgFilter },
            {
                $group: {
                    _id: '$academicYear',
                    count: { $sum: 1 },
                    totalStudents: { $sum: '$currentEnrollment' }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        const totalClasses = await Class.countDocuments(orgFilter);
        const totalCapacity = await Class.aggregate([
            { $match: orgFilter },
            { $group: { _id: null, total: { $sum: '$maxCapacity' } } }
        ]);
        const totalEnrolled = await Class.aggregate([
            { $match: orgFilter },
            { $group: { _id: null, total: { $sum: '$currentEnrollment' } } }
        ]);

        return {
            summary: {
                totalClasses,
                totalCapacity: totalCapacity[0]?.total || 0,
                totalEnrolled: totalEnrolled[0]?.total || 0,
                overallUtilization: totalCapacity[0]?.total > 0
                    ? ((totalEnrolled[0]?.total / totalCapacity[0]?.total) * 100).toFixed(2) + '%'
                    : '0%'
            },
            capacityStats,
            byDepartment,
            byAcademicYear
        };
    }

    /**
     * Get course analytics
     */
    async getCourseAnalytics(organizationId?: string): Promise<any> {
        const orgFilter = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

        // Courses by department
        const byDepartment = await Course.aggregate([
            { $match: orgFilter },
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
            {
                $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
            }
        ]);

        // Active vs inactive courses
        const now = new Date();
        const [activeCourses, upcomingCourses, completedCourses] = await Promise.all([
            Course.countDocuments({
                ...orgFilter,
                startDate: { $lte: now },
                endDate: { $gte: now }
            }),
            Course.countDocuments({
                ...orgFilter,
                startDate: { $gt: now }
            }),
            Course.countDocuments({
                ...orgFilter,
                endDate: { $lt: now }
            })
        ]);

        // Popular courses (by enrollment)
        const popularCourses = await Class.aggregate([
            { $match: orgFilter },
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
            {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            }
        ]);

        return {
            summary: {
                totalCourses: await Course.countDocuments(orgFilter),
                activeCourses,
                upcomingCourses,
                completedCourses
            },
            byDepartment,
            popularCourses
        };
    }

    /**
     * Get recent activities across the system
     */
    async getRecentActivities(limit: number = 20, organizationId?: string): Promise<any> {
        const orgFilter = organizationId ? { organizationId: new mongoose.Types.ObjectId(organizationId) } : {};

        // Get recent users
        const recentUsers = await User.find(orgFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullname email role createdAt')
            .lean();

        // Get recent classes
        const recentClasses = await Class.find(orgFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name academicYear createdAt')
            .lean();

        // Get recent exams
        const recentExams = await Exam.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name examType startDate createdAt')
            .lean();

        // Get recent events
        const recentEvents = await Events.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title eventType date createdAt')
            .lean();

        // Combine and sort all activities
        const activities = [
            ...recentUsers.map(u => ({ type: 'user', data: u, timestamp: u.createdAt })),
            ...recentClasses.map(c => ({ type: 'class', data: c, timestamp: c.createdAt })),
            ...recentExams.map(e => ({ type: 'exam', data: e, timestamp: e.createdAt })),
            ...recentEvents.map(e => ({ type: 'event', data: e, timestamp: e.createdAt }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

        return activities;
    }

    /**
     * Get organization-specific dashboard
     */
    async getOrganizationDashboard(organizationId: string): Promise<any> {
        const orgId = new mongoose.Types.ObjectId(organizationId);

        const [
            organization,
            userCount,
            studentCount,
            teacherCount,
            classCount,
            courseCount,
            departmentCount
        ] = await Promise.all([
            Organization.findById(organizationId),
            User.countDocuments({ organizationId: orgId }),
            Student.countDocuments({ organizationId: orgId }),
            Teacher.countDocuments({ organizationId: orgId }),
            Class.countDocuments({ organizationId: orgId }),
            Course.countDocuments({ organizationId: orgId }),
            Department.countDocuments({ organizationId: orgId })
        ]);

        if (!organization) {
            throw new Error('Organization not found');
        }

        // Get recent attendance for this organization
        const recentAttendance = await Attendance.aggregate([
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            {
                $unwind: '$class'
            },
            {
                $match: { 'class.organizationId': orgId }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            organization: {
                id: organization._id,
                name: organization.name,
                category: organization.category,
                contactEmail: organization.contactEmail
            },
            stats: {
                userCount,
                studentCount,
                teacherCount,
                classCount,
                courseCount,
                departmentCount
            },
            attendance: recentAttendance.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };
    }

    /**
     * Get all organizations with stats
     */
    async getAllOrganizationsWithStats(paginationOptions: PaginationOptions): Promise<any> {
        const { page, limit } = paginationOptions;
        const skip = (page - 1) * limit;

        const organizations = await Organization.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'users'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'classes'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'courses'
                }
            },
            {
                $project: {
                    name: 1,
                    category: 1,
                    contactEmail: 1,
                    createdAt: 1,
                    userCount: { $size: '$users' },
                    classCount: { $size: '$classes' },
                    courseCount: { $size: '$courses' }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        const totalOrganizations = await Organization.countDocuments();

        return {
            organizations,
            pagination: {
                page,
                limit,
                totalOrganizations,
                totalPages: Math.ceil(totalOrganizations / limit)
            }
        };
    }

    /**
     * Get system health metrics
     */
    async getSystemHealth(): Promise<any> {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        // Get collection sizes
        const collections = await mongoose.connection.db?.listCollections().toArray();
        const collectionStats = collections?.map(c => c.name) || [];

        return {
            database: {
                status: dbStatus,
                collections: collectionStats.length
            },
            timestamp: new Date(),
            uptime: process.uptime()
        };
    }
}

export const adminDashboardService = new AdminService();
