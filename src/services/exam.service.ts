import { Exam } from '../models/exam.models';
import { ApiError } from '../utils/ApiError';
import { ObjectId } from 'mongodb';
import { getMongoosePaginationOptions } from '../utils/healpers';
import { FilterQuery } from 'mongoose';

interface ExamData {
    name: string;
    description?: string;
    subjectId?: string;
    courseId?: string;
    classId?: string;
    teacherId?: string;
    duration: number;
    totalMarks: number;
    examType: 'quiz' | 'midterm' | 'final';
    startDate: Date;
    endDate: Date;
    schedule?: string;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

interface UserContext {
    role: string;
    organizationId?: string;
}

class ExamService {
    /**
     * Get all exams with pagination and role-based filtering
     */
    async getAllExams(paginationOptions: PaginationOptions, userContext: UserContext) {
        const { page, limit } = paginationOptions;
        const { role, organizationId } = userContext;

        const matchStage = role !== 'ADMIN' && organizationId 
            ? { organizationId: new ObjectId(organizationId) } 
            : {};

        const examAggregate = Exam.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject'
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
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'teacherId',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$course', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            }
        ]);

        const exams = await Exam.aggregatePaginate(
            examAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalExams",
                    docs: "exams",
                },
            }),
        );

        return exams;
    }

    /**
     * Create a new exam
     */
    async createExam(examData: ExamData) {
        // Check for duplicate exam with same name, date, and class
        const existingExam = await Exam.findOne({
            name: examData.name,
            classId: examData.classId,
            startDate: examData.startDate
        });

        if (existingExam) {
            throw new ApiError(409, "An exam with the same name, class, and start date already exists");
        }

        // Validate date range
        if (new Date(examData.startDate) >= new Date(examData.endDate)) {
            throw new ApiError(400, "Start date must be before end date");
        }

        const exam = await Exam.create(examData);
        return exam;
    }

    /**
     * Get exam by ID with populated references
     */
    async getExamById(examId: string) {
        const exam = await Exam.findById(examId)
            .populate('subjectId', 'name code')
            .populate('courseId', 'name code')
            .populate('classId', 'name section')
            .populate('teacherId', 'firstName lastName email');

        if (!exam) {
            throw new ApiError(404, "Exam not found");
        }

        return exam;
    }

    /**
     * Update exam by ID
     */
    async updateExam(examId: string, examData: Partial<ExamData>) {
        const exam = await Exam.findById(examId);

        if (!exam) {
            throw new ApiError(404, "Exam not found");
        }

        // Validate date range if dates are being updated
        if (examData.startDate && examData.endDate) {
            if (new Date(examData.startDate) >= new Date(examData.endDate)) {
                throw new ApiError(400, "Start date must be before end date");
            }
        } else if (examData.startDate && !examData.endDate) {
            if (new Date(examData.startDate) >= new Date(exam.endDate)) {
                throw new ApiError(400, "Start date must be before end date");
            }
        } else if (!examData.startDate && examData.endDate) {
            if (new Date(exam.startDate) >= new Date(examData.endDate)) {
                throw new ApiError(400, "Start date must be before end date");
            }
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            { $set: examData },
            { new: true }
        )
            .populate('subjectId', 'name code')
            .populate('courseId', 'name code')
            .populate('classId', 'name section')
            .populate('teacherId', 'firstName lastName email');

        return updatedExam;
    }

    /**
     * Delete exam by ID
     */
    async deleteExam(examId: string) {
        const exam = await Exam.findById(examId);

        if (!exam) {
            throw new ApiError(404, "Exam not found");
        }

        await Exam.deleteOne({ _id: examId });
        return { message: "Exam deleted successfully" };
    }

    /**
     * Bulk create exams from array
     */
    async createBulkExams(examsData: ExamData[]) {
        // Validate all exams before inserting
        for (const examData of examsData) {
            if (!examData.name || !examData.duration || !examData.totalMarks || 
                !examData.examType || !examData.startDate || !examData.endDate) {
                throw new ApiError(400, `Missing required fields for exam: ${examData.name || 'Unknown'}`);
            }

            if (new Date(examData.startDate) >= new Date(examData.endDate)) {
                throw new ApiError(400, `Invalid date range for exam: ${examData.name}`);
            }
        }

        const createdExams = await Exam.insertMany(examsData);
        return createdExams;
    }

    /**
     * Bulk delete exams by IDs
     */
    async deleteBulkExams(examIds: string[]) {
        if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
            throw new ApiError(400, "Please provide an array of exam IDs");
        }

        const result = await Exam.deleteMany({ _id: { $in: examIds } });
        return { 
            message: "Exams deleted successfully", 
            deletedCount: result.deletedCount 
        };
    }

    /**
     * Get exams by class ID
     */
    async getExamsByClass(classId: string, paginationOptions: PaginationOptions) {
        const { page, limit } = paginationOptions;

        const examAggregate = Exam.aggregate([
            { $match: { classId: new ObjectId(classId) } },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject'
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: 'teacherId',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { startDate: 1 } }
        ]);

        const exams = await Exam.aggregatePaginate(
            examAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalExams",
                    docs: "exams",
                },
            }),
        );

        return exams;
    }

    /**
     * Get exams by teacher ID
     */
    async getExamsByTeacher(teacherId: string, paginationOptions: PaginationOptions) {
        const { page, limit } = paginationOptions;

        const examAggregate = Exam.aggregate([
            { $match: { teacherId: new ObjectId(teacherId) } },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject'
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
                $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            { $sort: { startDate: 1 } }
        ]);

        const exams = await Exam.aggregatePaginate(
            examAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalExams",
                    docs: "exams",
                },
            }),
        );

        return exams;
    }

    /**
     * Get exams by course ID
     */
    async getExamsByCourse(courseId: string, paginationOptions: PaginationOptions) {
        const { page, limit } = paginationOptions;

        const examAggregate = Exam.aggregate([
            { $match: { courseId: new ObjectId(courseId) } },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject'
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
                    localField: 'teacherId',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { startDate: 1 } }
        ]);

        const exams = await Exam.aggregatePaginate(
            examAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalExams",
                    docs: "exams",
                },
            }),
        );

        return exams;
    }

    /**
     * Get upcoming exams (exams that haven't started yet)
     */
    async getUpcomingExams(paginationOptions: PaginationOptions, userContext: UserContext) {
        const { page, limit } = paginationOptions;
        const { role, organizationId } = userContext;

        const matchStage: FilterQuery<typeof Exam> = {
            startDate: { $gt: new Date() }
        };

        if (role !== 'ADMIN' && organizationId) {
            matchStage.organizationId = new ObjectId(organizationId);
        }

        const examAggregate = Exam.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject'
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
                $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            { $sort: { startDate: 1 } }
        ]);

        const exams = await Exam.aggregatePaginate(
            examAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalExams",
                    docs: "exams",
                },
            }),
        );

        return exams;
    }

    /**
     * Get exams by type (quiz, midterm, final)
     */
    async getExamsByType(examType: string, paginationOptions: PaginationOptions, userContext: UserContext) {
        const { page, limit } = paginationOptions;
        const { role, organizationId } = userContext;

        const matchStage: FilterQuery<typeof Exam> = { examType };

        if (role !== 'ADMIN' && organizationId) {
            matchStage.organizationId = new ObjectId(organizationId);
        }

        const examAggregate = Exam.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subjectId',
                    foreignField: '_id',
                    as: 'subject'
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
                    localField: 'teacherId',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
            },
            { $sort: { startDate: 1 } }
        ]);

        const exams = await Exam.aggregatePaginate(
            examAggregate,
            getMongoosePaginationOptions({
                page,
                limit,
                customLabels: {
                    totalDocs: "totalExams",
                    docs: "exams",
                },
            }),
        );

        return exams;
    }
}

export const examService = new ExamService();
export default ExamService;
