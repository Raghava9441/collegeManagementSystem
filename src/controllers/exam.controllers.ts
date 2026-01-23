import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { examService } from '../services/exam.service';
import { isValidObjectId } from 'mongoose';
import * as XLSX from 'xlsx';

/**
 * Get all exams with pagination
 * @route GET /api/v1/exams
 */
const getAllExams = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    const { role, organizationId } = req.user;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const exams = await examService.getAllExams(
        { page: parsedPage, limit: parsedLimit },
        { role, organizationId }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, exams, "Exams fetched successfully"));
});

/**
 * Create a new exam
 * @route POST /api/v1/exams
 */
const createExam = asyncHandler(async (req: Request, res: Response) => {
    const { 
        name, 
        description, 
        subjectId, 
        courseId, 
        classId, 
        teacherId, 
        duration, 
        totalMarks, 
        examType, 
        startDate, 
        endDate, 
        schedule 
    } = req.body;

    const exam = await examService.createExam({
        name,
        description,
        subjectId,
        courseId,
        classId,
        teacherId,
        duration,
        totalMarks,
        examType,
        startDate,
        endDate,
        schedule,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, exam, "Exam created successfully"));
});

/**
 * Get exam by ID
 * @route GET /api/v1/exams/:examId
 */
const getExamById = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
        throw new ApiError(400, "Invalid exam ID");
    }

    const exam = await examService.getExamById(examId);

    return res
        .status(200)
        .json(new ApiResponse(200, exam, "Exam fetched successfully"));
});

/**
 * Update exam by ID
 * @route PUT /api/v1/exams/:examId
 */
const updateExam = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const { 
        name, 
        description, 
        subjectId, 
        courseId, 
        classId, 
        teacherId, 
        duration, 
        totalMarks, 
        examType, 
        startDate, 
        endDate, 
        schedule 
    } = req.body;

    if (!isValidObjectId(examId)) {
        throw new ApiError(400, "Invalid exam ID");
    }

    const updatedExam = await examService.updateExam(examId, {
        name,
        description,
        subjectId,
        courseId,
        classId,
        teacherId,
        duration,
        totalMarks,
        examType,
        startDate,
        endDate,
        schedule,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedExam, "Exam updated successfully"));
});

/**
 * Delete exam by ID
 * @route DELETE /api/v1/exams/:examId
 */
const deleteExam = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
        throw new ApiError(400, "Invalid exam ID");
    }

    await examService.deleteExam(examId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Exam deleted successfully"));
});

/**
 * Bulk create exams from Excel file
 * @route POST /api/v1/exams/bulk
 */
const createBulkExams = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No file uploaded");
    }

    // Parse the Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const examsData = XLSX.utils.sheet_to_json(sheet);

    // Transform and validate data
    const transformedExams = examsData.map((data: any) => ({
        name: data.name,
        description: data.description,
        subjectId: data.subjectId,
        courseId: data.courseId,
        classId: data.classId,
        teacherId: data.teacherId,
        duration: parseInt(data.duration, 10),
        totalMarks: parseInt(data.totalMarks, 10),
        examType: data.examType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        schedule: data.schedule,
    }));

    const createdExams = await examService.createBulkExams(transformedExams);

    return res
        .status(201)
        .json(new ApiResponse(201, createdExams, "Exams created successfully"));
});

/**
 * Bulk delete exams
 * @route DELETE /api/v1/exams/bulk
 */
const deleteBulkExams = asyncHandler(async (req: Request, res: Response) => {
    const { examIds } = req.body;

    const result = await examService.deleteBulkExams(examIds);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Exams deleted successfully"));
});

/**
 * Get exams by class ID
 * @route GET /api/v1/exams/class/:classId
 */
const getExamsByClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const exams = await examService.getExamsByClass(classId, {
        page: parsedPage,
        limit: parsedLimit,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, exams, "Exams fetched successfully"));
});

/**
 * Get exams by teacher ID
 * @route GET /api/v1/exams/teacher/:teacherId
 */
const getExamsByTeacher = asyncHandler(async (req: Request, res: Response) => {
    const { teacherId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(teacherId)) {
        throw new ApiError(400, "Invalid teacher ID");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const exams = await examService.getExamsByTeacher(teacherId, {
        page: parsedPage,
        limit: parsedLimit,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, exams, "Exams fetched successfully"));
});

/**
 * Get exams by course ID
 * @route GET /api/v1/exams/course/:courseId
 */
const getExamsByCourse = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course ID");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const exams = await examService.getExamsByCourse(courseId, {
        page: parsedPage,
        limit: parsedLimit,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, exams, "Exams fetched successfully"));
});

/**
 * Get upcoming exams
 * @route GET /api/v1/exams/upcoming
 */
const getUpcomingExams = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    const { role, organizationId } = req.user;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const exams = await examService.getUpcomingExams(
        { page: parsedPage, limit: parsedLimit },
        { role, organizationId }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, exams, "Upcoming exams fetched successfully"));
});

/**
 * Get exams by type
 * @route GET /api/v1/exams/type
 */
const getExamsByType = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!type || !['quiz', 'midterm', 'final'].includes(type as string)) {
        throw new ApiError(400, "Invalid exam type. Must be one of: quiz, midterm, final");
    }

    const { role, organizationId } = req.user;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const exams = await examService.getExamsByType(
        type as string,
        { page: parsedPage, limit: parsedLimit },
        { role, organizationId }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, exams, `${type} exams fetched successfully`));
});

export {
    getAllExams,
    createExam,
    getExamById,
    updateExam,
    deleteExam,
    createBulkExams,
    deleteBulkExams,
    getExamsByClass,
    getExamsByTeacher,
    getExamsByCourse,
    getUpcomingExams,
    getExamsByType,
};
