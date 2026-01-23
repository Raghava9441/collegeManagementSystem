import { Attendance } from '../models/attendance.models';
import { Student } from '../models/student.models';
import { Class } from '../models/class.models';
import { Teacher } from '../models/teacher.model';
import { ApiError } from '../utils/ApiError';
import { ObjectId } from 'mongodb';
import { getMongoosePaginationOptions } from '../utils/healpers';
import { FilterQuery } from 'mongoose';

interface AttendanceData {
    classId: string;
    studentId: string;
    date: Date;
    status: 'present' | 'absent' | 'excused';
    remarks?: string;
    markedBy: string;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

interface UserContext {
    role: string;
    organizationId?: string;
}

interface AttendanceFilter {
    classId?: string;
    studentId?: string;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    status?: string;
}

class AttendanceService {
    /**
     * Get all attendances with pagination and role-based filtering
     */
    async getAllAttendances(paginationOptions: PaginationOptions, userContext: UserContext, filters?: AttendanceFilter) {
        const { page, limit } = paginationOptions;
        const { role, organizationId } = userContext;

        const matchStage: FilterQuery<typeof Attendance> = {};

        // Apply filters if provided
        if (filters?.classId) {
            matchStage.classId = new ObjectId(filters.classId);
        }
        if (filters?.studentId) {
            matchStage.studentId = new ObjectId(filters.studentId);
        }
        if (filters?.status) {
            matchStage.status = filters.status;
        }
        if (filters?.date) {
            matchStage.date = filters.date;
        }
        if (filters?.startDate && filters?.endDate) {
            matchStage.date = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        const attendanceAggregate = Attendance.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'markedBy',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$student', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { date: -1 } }
        ]);

        const attendances = await Attendance.aggregatePaginate(
            attendanceAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalAttendances",
                    docs: "attendances",
                },
            }),
        );

        return attendances;
    }

    /**
     * Create a new attendance record
     */
    async createAttendance(attendanceData: AttendanceData) {
        // Validate student exists
        const existingStudent = await Student.findById(attendanceData.studentId);
        if (!existingStudent) {
            throw new ApiError(404, "Student not found");
        }

        // Validate class exists
        const existingClass = await Class.findById(attendanceData.classId);
        if (!existingClass) {
            throw new ApiError(404, "Class not found");
        }

        // Validate teacher exists
        const existingTeacher = await Teacher.findById(attendanceData.markedBy);
        if (!existingTeacher) {
            throw new ApiError(404, "Teacher not found");
        }

        // Check for duplicate attendance record for same student, class, and date
        const existingAttendance = await Attendance.findOne({
            studentId: attendanceData.studentId,
            classId: attendanceData.classId,
            date: {
                $gte: new Date(new Date(attendanceData.date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(attendanceData.date).setHours(23, 59, 59, 999))
            }
        });

        if (existingAttendance) {
            throw new ApiError(409, "Attendance already marked for this student on this date");
        }

        const attendance = await Attendance.create(attendanceData);
        return attendance;
    }

    /**
     * Get attendance by ID with populated references
     */
    async getAttendanceById(attendanceId: string) {
        const attendance = await Attendance.findById(attendanceId)
            .populate('studentId', 'firstName lastName email rollNumber')
            .populate('classId', 'name section')
            .populate('markedBy', 'firstName lastName email');

        if (!attendance) {
            throw new ApiError(404, "Attendance record not found");
        }

        return attendance;
    }

    /**
     * Update attendance by ID
     */
    async updateAttendance(attendanceId: string, attendanceData: Partial<AttendanceData>) {
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            throw new ApiError(404, "Attendance record not found");
        }

        // Validate references if being updated
        if (attendanceData.studentId) {
            const existingStudent = await Student.findById(attendanceData.studentId);
            if (!existingStudent) {
                throw new ApiError(404, "Student not found");
            }
        }

        if (attendanceData.classId) {
            const existingClass = await Class.findById(attendanceData.classId);
            if (!existingClass) {
                throw new ApiError(404, "Class not found");
            }
        }

        if (attendanceData.markedBy) {
            const existingTeacher = await Teacher.findById(attendanceData.markedBy);
            if (!existingTeacher) {
                throw new ApiError(404, "Teacher not found");
            }
        }

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            attendanceId,
            { $set: attendanceData },
            { new: true }
        )
            .populate('studentId', 'firstName lastName email rollNumber')
            .populate('classId', 'name section')
            .populate('markedBy', 'firstName lastName email');

        return updatedAttendance;
    }

    /**
     * Delete attendance by ID
     */
    async deleteAttendance(attendanceId: string) {
        const attendance = await Attendance.findById(attendanceId);

        if (!attendance) {
            throw new ApiError(404, "Attendance record not found");
        }

        await Attendance.deleteOne({ _id: attendanceId });
        return { message: "Attendance deleted successfully" };
    }

    /**
     * Bulk create attendances from array
     */
    async createBulkAttendances(attendancesData: AttendanceData[]) {
        // Validate all attendances before inserting
        for (const data of attendancesData) {
            if (!data.studentId || !data.classId || !data.date || !data.status || !data.markedBy) {
                throw new ApiError(400, `Missing required fields for attendance record`);
            }
        }

        const createdAttendances = await Attendance.insertMany(attendancesData);
        return createdAttendances;
    }

    /**
     * Bulk delete attendances by IDs
     */
    async deleteBulkAttendances(attendanceIds: string[]) {
        if (!attendanceIds || !Array.isArray(attendanceIds) || attendanceIds.length === 0) {
            throw new ApiError(400, "Please provide an array of attendance IDs");
        }

        const result = await Attendance.deleteMany({ _id: { $in: attendanceIds } });
        return {
            message: "Attendances deleted successfully",
            deletedCount: result.deletedCount
        };
    }

    /**
     * Get attendance by student ID
     */
    async getAttendanceByStudent(studentId: string, paginationOptions: PaginationOptions, dateRange?: { startDate: Date; endDate: Date }) {
        const { page, limit } = paginationOptions;

        const matchStage: FilterQuery<typeof Attendance> = {
            studentId: new ObjectId(studentId)
        };

        if (dateRange?.startDate && dateRange?.endDate) {
            matchStage.date = {
                $gte: new Date(dateRange.startDate),
                $lte: new Date(dateRange.endDate)
            };
        }

        const attendanceAggregate = Attendance.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'markedBy',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { date: -1 } }
        ]);

        const attendances = await Attendance.aggregatePaginate(
            attendanceAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalAttendances",
                    docs: "attendances",
                },
            }),
        );

        return attendances;
    }

    /**
     * Get attendance by class ID
     */
    async getAttendanceByClass(classId: string, paginationOptions: PaginationOptions, date?: Date) {
        const { page, limit } = paginationOptions;

        const matchStage: FilterQuery<typeof Attendance> = {
            classId: new ObjectId(classId)
        };

        if (date) {
            matchStage.date = {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
            };
        }

        const attendanceAggregate = Attendance.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'markedBy',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$student', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { date: -1, 'student.firstName': 1 } }
        ]);

        const attendances = await Attendance.aggregatePaginate(
            attendanceAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalAttendances",
                    docs: "attendances",
                },
            }),
        );

        return attendances;
    }

    /**
     * Get attendance by date
     */
    async getAttendanceByDate(date: Date, paginationOptions: PaginationOptions) {
        const { page, limit } = paginationOptions;

        const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

        const attendanceAggregate = Attendance.aggregate([
            {
                $match: {
                    date: { $gte: startOfDay, $lt: endOfDay }
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'markedBy',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$student', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { 'class.name': 1, 'student.firstName': 1 } }
        ]);

        const attendances = await Attendance.aggregatePaginate(
            attendanceAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalAttendances",
                    docs: "attendances",
                },
            }),
        );

        return attendances;
    }

    /**
     * Get attendance statistics for a student
     */
    async getStudentAttendanceStats(studentId: string, dateRange?: { startDate: Date; endDate: Date }) {
        const matchStage: FilterQuery<typeof Attendance> = {
            studentId: new ObjectId(studentId)
        };

        if (dateRange?.startDate && dateRange?.endDate) {
            matchStage.date = {
                $gte: new Date(dateRange.startDate),
                $lte: new Date(dateRange.endDate)
            };
        }

        const stats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalDays = stats.reduce((acc, curr) => acc + curr.count, 0);
        const presentDays = stats.find(s => s._id === 'present')?.count || 0;
        const absentDays = stats.find(s => s._id === 'absent')?.count || 0;
        const excusedDays = stats.find(s => s._id === 'excused')?.count || 0;

        return {
            totalDays,
            presentDays,
            absentDays,
            excusedDays,
            attendancePercentage: totalDays > 0 ? ((presentDays + excusedDays) / totalDays * 100).toFixed(2) : 0
        };
    }

    /**
     * Get attendance statistics for a class
     */
    async getClassAttendanceStats(classId: string, date?: Date) {
        const matchStage: FilterQuery<typeof Attendance> = {
            classId: new ObjectId(classId)
        };

        if (date) {
            matchStage.date = {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
            };
        }

        const stats = await Attendance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalRecords = stats.reduce((acc, curr) => acc + curr.count, 0);
        const presentCount = stats.find(s => s._id === 'present')?.count || 0;
        const absentCount = stats.find(s => s._id === 'absent')?.count || 0;
        const excusedCount = stats.find(s => s._id === 'excused')?.count || 0;

        return {
            totalRecords,
            presentCount,
            absentCount,
            excusedCount,
            attendancePercentage: totalRecords > 0 ? ((presentCount + excusedCount) / totalRecords * 100).toFixed(2) : 0
        };
    }

    /**
     * Mark attendance for multiple students at once
     */
    async markBulkAttendance(classId: string, date: Date, attendanceRecords: { studentId: string; status: 'present' | 'absent' | 'excused'; remarks?: string }[], markedBy: string) {
        // Validate class exists
        const existingClass = await Class.findById(classId);
        if (!existingClass) {
            throw new ApiError(404, "Class not found");
        }

        // Validate teacher exists
        const existingTeacher = await Teacher.findById(markedBy);
        if (!existingTeacher) {
            throw new ApiError(404, "Teacher not found");
        }

        const attendanceData = attendanceRecords.map(record => ({
            classId,
            studentId: record.studentId,
            date,
            status: record.status,
            remarks: record.remarks,
            markedBy
        }));

        // Delete existing attendance for the same class and date
        await Attendance.deleteMany({
            classId: new ObjectId(classId),
            date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
            }
        });

        const createdAttendances = await Attendance.insertMany(attendanceData);
        return createdAttendances;
    }
}

export const attendanceService = new AttendanceService();
export default AttendanceService;
