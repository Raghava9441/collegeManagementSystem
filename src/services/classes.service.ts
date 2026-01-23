// src/services/classes.service.ts
import mongoose from 'mongoose';
import { Class, IClass } from '../models/class.models';
import { Organization } from '../models/organization.models';
import { Student } from '../models/student.models';
import { Teacher } from '../models/teacher.model';
import { Course } from '../models/course.models';
import { ApiError } from '../utils/ApiError';
import { getMongoosePaginationOptions } from '../utils/healpers';
import GenericService from './generic.service';
import { ObjectId } from 'mongodb';

interface PaginationOptions {
    page: number;
    limit: number;
}

class ClassesService {
    private classService: GenericService<any, any>;

    constructor() {
        this.classService = new GenericService<any, any>(Class);
    }

    async createClass(classData: Partial<IClass>): Promise<IClass> {
        return await this.classService.create(classData);
    }

    async findOne(query: any): Promise<IClass | null> {
        return await this.classService.findOne(query);
    }

    async getAllClasses(): Promise<IClass[]> {
        return await this.classService.getAll();
    }

    async getAllClassesWithFilter(filter: any): Promise<IClass[]> {
        return await this.classService.getAllWithFilter(filter);
    }

    async getClassById(classId: string): Promise<IClass> {
        const classItem = await Class.findById(classId)
            .populate('courseId', 'name code description')
            .populate('classTeacherId', 'firstName lastName email')
            .populate('supervisorId', 'firstName lastName email')
            .populate('departmentId', 'name code')
            .populate('studentIds', 'firstName lastName email rollNumber')
            .populate('createdBy', 'firstName lastName email');

        if (!classItem) {
            throw new ApiError(404, "Class not found");
        }

        return classItem;
    }

    async updateClassById(classId: string, updateData: Partial<IClass>): Promise<IClass> {
        return await this.classService.update(classId, updateData);
    }

    async deleteClassById(classId: string): Promise<IClass> {
        return await this.classService.delete(classId);
    }

    async deleteBulkClasses(classIds: string[]): Promise<any> {
        if (!classIds || !Array.isArray(classIds) || classIds.length === 0) {
            throw new ApiError(400, "Please provide an array of class IDs");
        }
        const result = await this.classService.deleteMany({ _id: { $in: classIds } });
        return {
            message: "Classes deleted successfully",
            deletedCount: result.deletedCount
        };
    }

    async getClassesPaginate(parsedPage: number, parsedLimit: number, orgId: string): Promise<any> {
        const classAggregate = Class.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(orgId) } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'classTeacherId',
                    foreignField: '_id',
                    as: 'classTeacher'
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$classTeacher', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    enrolledStudentsCount: { $size: { $ifNull: ['$studentIds', []] } }
                }
            }
        ]);

        const classes = await Class.aggregatePaginate(
            classAggregate,
            getMongoosePaginationOptions({
                page: parsedPage,
                limit: parsedLimit,
                customLabels: {
                    totalDocs: "totalClasses",
                    docs: "classes",
                },
            }),
        );
        return classes;
    }

    /**
     * Create multiple classes at once
     */
    async createBulkClasses(classesData: Partial<IClass>[]): Promise<IClass[]> {
        // Validate all classes before inserting
        for (const classData of classesData) {
            if (!classData.name || !classData.courseId || !classData.classTeacherId || 
                !classData.organizationId || !classData.academicYear) {
                throw new ApiError(400, `Missing required fields for class: ${classData.name || 'Unknown'}`);
            }
        }

        const createdClasses = await Class.insertMany(classesData);
        return createdClasses;
    }

    /**
     * Enroll a student in a class
     */
    async enrollStudent(classId: string, studentId: string): Promise<IClass> {
        const classItem = await Class.findById(classId);
        if (!classItem) {
            throw new ApiError(404, "Class not found");
        }

        const student = await Student.findById(studentId);
        if (!student) {
            throw new ApiError(404, "Student not found");
        }

        // Check if student is already enrolled
        if (classItem.studentIds.includes(new mongoose.Types.ObjectId(studentId))) {
            throw new ApiError(409, "Student is already enrolled in this class");
        }

        // Check capacity
        if (classItem.currentEnrollment >= classItem.maxCapacity) {
            throw new ApiError(400, "Class is at maximum capacity");
        }

        classItem.studentIds.push(new mongoose.Types.ObjectId(studentId));
        classItem.currentEnrollment += 1;
        await classItem.save();

        return classItem;
    }

    /**
     * Remove a student from a class
     */
    async removeStudent(classId: string, studentId: string): Promise<IClass> {
        const classItem = await Class.findById(classId);
        if (!classItem) {
            throw new ApiError(404, "Class not found");
        }

        const studentObjectId = new mongoose.Types.ObjectId(studentId);
        const studentIndex = classItem.studentIds.findIndex(
            (id: mongoose.Types.ObjectId) => id.equals(studentObjectId)
        );

        if (studentIndex === -1) {
            throw new ApiError(404, "Student is not enrolled in this class");
        }

        classItem.studentIds.splice(studentIndex, 1);
        classItem.currentEnrollment = Math.max(0, classItem.currentEnrollment - 1);
        await classItem.save();

        return classItem;
    }

    /**
     * Enroll multiple students in a class
     */
    async enrollMultipleStudents(classId: string, studentIds: string[]): Promise<IClass> {
        const classItem = await Class.findById(classId);
        if (!classItem) {
            throw new ApiError(404, "Class not found");
        }

        // Check capacity
        const availableSlots = classItem.maxCapacity - classItem.currentEnrollment;
        if (studentIds.length > availableSlots) {
            throw new ApiError(400, `Only ${availableSlots} slots available in this class`);
        }

        // Validate all students exist
        const students = await Student.find({ _id: { $in: studentIds } });
        if (students.length !== studentIds.length) {
            throw new ApiError(404, "One or more students not found");
        }

        // Filter out already enrolled students
        const newStudentIds = studentIds.filter(
            (id) => !classItem.studentIds.some(
                (existingId: mongoose.Types.ObjectId) => existingId.equals(new mongoose.Types.ObjectId(id))
            )
        );

        if (newStudentIds.length === 0) {
            throw new ApiError(409, "All students are already enrolled in this class");
        }

        classItem.studentIds.push(...newStudentIds.map(id => new mongoose.Types.ObjectId(id)));
        classItem.currentEnrollment += newStudentIds.length;
        await classItem.save();

        return classItem;
    }

    /**
     * Get classes by teacher ID
     */
    async getClassesByTeacher(teacherId: string, paginationOptions: PaginationOptions, orgId: string): Promise<any> {
        const { page, limit } = paginationOptions;

        const classAggregate = Class.aggregate([
            {
                $match: {
                    classTeacherId: new mongoose.Types.ObjectId(teacherId),
                    organizationId: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    enrolledStudentsCount: { $size: { $ifNull: ['$studentIds', []] } }
                }
            }
        ]);

        const classes = await Class.aggregatePaginate(
            classAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalClasses",
                    docs: "classes",
                },
            }),
        );

        return classes;
    }

    /**
     * Get classes by course ID
     */
    async getClassesByCourse(courseId: string, paginationOptions: PaginationOptions, orgId: string): Promise<any> {
        const { page, limit } = paginationOptions;

        const classAggregate = Class.aggregate([
            {
                $match: {
                    courseId: new mongoose.Types.ObjectId(courseId),
                    organizationId: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'classTeacherId',
                    foreignField: '_id',
                    as: 'classTeacher'
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: { path: '$classTeacher', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    enrolledStudentsCount: { $size: { $ifNull: ['$studentIds', []] } }
                }
            }
        ]);

        const classes = await Class.aggregatePaginate(
            classAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalClasses",
                    docs: "classes",
                },
            }),
        );

        return classes;
    }

    /**
     * Get classes by department ID
     */
    async getClassesByDepartment(departmentId: string, paginationOptions: PaginationOptions, orgId: string): Promise<any> {
        const { page, limit } = paginationOptions;

        const classAggregate = Class.aggregate([
            {
                $match: {
                    departmentId: new mongoose.Types.ObjectId(departmentId),
                    organizationId: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'classTeacherId',
                    foreignField: '_id',
                    as: 'classTeacher'
                }
            },
            {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$classTeacher', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    enrolledStudentsCount: { $size: { $ifNull: ['$studentIds', []] } }
                }
            }
        ]);

        const classes = await Class.aggregatePaginate(
            classAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalClasses",
                    docs: "classes",
                },
            }),
        );

        return classes;
    }

    /**
     * Get students in a class
     */
    async getStudentsInClass(classId: string, paginationOptions: PaginationOptions): Promise<any> {
        const { page, limit } = paginationOptions;

        const classItem = await Class.findById(classId);
        if (!classItem) {
            throw new ApiError(404, "Class not found");
        }

        const skip = (page - 1) * limit;
        const studentIds = classItem.studentIds.slice(skip, skip + limit);

        const students = await Student.find({ _id: { $in: studentIds } })
            .select('firstName lastName email rollNumber phone address')
            .lean();

        return {
            students,
            totalStudents: classItem.studentIds.length,
            page,
            limit,
            totalPages: Math.ceil(classItem.studentIds.length / limit)
        };
    }

    /**
     * Get classes by academic year
     */
    async getClassesByAcademicYear(academicYear: string, paginationOptions: PaginationOptions, orgId: string): Promise<any> {
        const { page, limit } = paginationOptions;

        const classAggregate = Class.aggregate([
            {
                $match: {
                    academicYear,
                    organizationId: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'classTeacherId',
                    foreignField: '_id',
                    as: 'classTeacher'
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$classTeacher', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    enrolledStudentsCount: { $size: { $ifNull: ['$studentIds', []] } }
                }
            }
        ]);

        const classes = await Class.aggregatePaginate(
            classAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalClasses",
                    docs: "classes",
                },
            }),
        );

        return classes;
    }

    /**
     * Get class statistics
     */
    async getClassStats(classId: string): Promise<any> {
        const classItem = await Class.findById(classId)
            .populate('courseId', 'name')
            .populate('classTeacherId', 'firstName lastName')
            .populate('departmentId', 'name');

        if (!classItem) {
            throw new ApiError(404, "Class not found");
        }

        return {
            className: classItem.name,
            course: classItem.courseId,
            classTeacher: classItem.classTeacherId,
            department: classItem.departmentId,
            academicYear: classItem.academicYear,
            totalEnrolled: classItem.currentEnrollment,
            maxCapacity: classItem.maxCapacity,
            availableSlots: classItem.maxCapacity - classItem.currentEnrollment,
            occupancyRate: ((classItem.currentEnrollment / classItem.maxCapacity) * 100).toFixed(2) + '%',
            credits: classItem.credits,
            classroom: classItem.classroom,
            schedule: classItem.schedule
        };
    }

    /**
     * Transfer student between classes
     */
    async transferStudent(fromClassId: string, toClassId: string, studentId: string): Promise<{ fromClass: IClass; toClass: IClass }> {
        // Remove from source class
        const fromClass = await this.removeStudent(fromClassId, studentId);

        try {
            // Add to destination class
            const toClass = await this.enrollStudent(toClassId, studentId);
            return { fromClass, toClass };
        } catch (error) {
            // Rollback: re-add student to source class if enrollment fails
            await this.enrollStudent(fromClassId, studentId);
            throw error;
        }
    }
}

export const classesService = new ClassesService();
