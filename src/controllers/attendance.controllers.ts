import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { attendanceService } from "../services/attendance.service";
import { isValidObjectId } from "mongoose";
import * as XLSX from 'xlsx';

/**
 * Get all attendances with pagination and filters
 * @route GET /api/v1/attendances
 */
const getAllAttendances = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, classId, studentId, status, date, startDate, endDate } = req.query;

    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    const { role, organizationId } = req.user;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const filters = {
        classId: classId as string | undefined,
        studentId: studentId as string | undefined,
        status: status as string | undefined,
        date: date ? new Date(date as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const attendances = await attendanceService.getAllAttendances(
        { page: parsedPage, limit: parsedLimit },
        { role, organizationId },
        filters
    );

    return res
        .status(200)
        .json(new ApiResponse(200, attendances, "Attendances fetched successfully"));
});

/**
 * Create a new attendance record
 * @route POST /api/v1/attendances
 */
const createAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, classId, date, status, remarks, markedBy } = req.body;

    const attendance = await attendanceService.createAttendance({
        studentId,
        classId,
        date,
        status,
        remarks,
        markedBy,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, attendance, "Attendance created successfully"));
});

/**
 * Get attendance by ID
 * @route GET /api/v1/attendances/:attendanceId
 */
const getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
    const { attendanceId } = req.params;

    if (!isValidObjectId(attendanceId)) {
        throw new ApiError(400, "Invalid attendance ID");
    }

    const attendance = await attendanceService.getAttendanceById(attendanceId);

    return res
        .status(200)
        .json(new ApiResponse(200, attendance, "Attendance fetched successfully"));
});

/**
 * Update attendance by ID
 * @route PUT /api/v1/attendances/:attendanceId
 */
const updateAttendanceById = asyncHandler(async (req: Request, res: Response) => {
    const { attendanceId } = req.params;
    const { studentId, classId, date, status, remarks, markedBy } = req.body;

    if (!isValidObjectId(attendanceId)) {
        throw new ApiError(400, "Invalid attendance ID");
    }

    const updatedAttendance = await attendanceService.updateAttendance(attendanceId, {
        studentId,
        classId,
        date,
        status,
        remarks,
        markedBy,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAttendance, "Attendance updated successfully"));
});

/**
 * Delete attendance by ID
 * @route DELETE /api/v1/attendances/:attendanceId
 */
const deleteAttendanceById = asyncHandler(async (req: Request, res: Response) => {
    const { attendanceId } = req.params;

    if (!isValidObjectId(attendanceId)) {
        throw new ApiError(400, "Invalid attendance ID");
    }

    await attendanceService.deleteAttendance(attendanceId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Attendance deleted successfully"));
});

/**
 * Bulk create attendances from Excel file
 * @route POST /api/v1/attendances/bulk
 */
const createBulkAttendances = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No file uploaded");
    }

    // Parse the Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const attendancesData = XLSX.utils.sheet_to_json(sheet);

    // Transform data
    const transformedAttendances = attendancesData.map((data: any) => ({
        studentId: data.studentId,
        classId: data.classId,
        date: new Date(data.date),
        status: data.status,
        remarks: data.remarks,
        markedBy: data.markedBy,
    }));

    const createdAttendances = await attendanceService.createBulkAttendances(transformedAttendances);

    return res
        .status(201)
        .json(new ApiResponse(201, createdAttendances, "Attendances created successfully"));
});

/**
 * Bulk delete attendances
 * @route DELETE /api/v1/attendances/bulk
 */
const deleteBulkAttendances = asyncHandler(async (req: Request, res: Response) => {
    const { attendanceIds } = req.body;

    const result = await attendanceService.deleteBulkAttendances(attendanceIds);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Attendances deleted successfully"));
});

/**
 * Get attendance by student ID
 * @route GET /api/v1/attendances/student/:studentId
 */
const getAttendanceByStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    if (!isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid student ID");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;

    const attendances = await attendanceService.getAttendanceByStudent(
        studentId,
        { page: parsedPage, limit: parsedLimit },
        dateRange
    );

    return res
        .status(200)
        .json(new ApiResponse(200, attendances, "Student attendance fetched successfully"));
});

/**
 * Get attendance by class ID
 * @route GET /api/v1/attendances/class/:classId
 */
const getAttendanceByClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { page = 1, limit = 10, date } = req.query;

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const attendances = await attendanceService.getAttendanceByClass(
        classId,
        { page: parsedPage, limit: parsedLimit },
        date ? new Date(date as string) : undefined
    );

    return res
        .status(200)
        .json(new ApiResponse(200, attendances, "Class attendance fetched successfully"));
});

/**
 * Get attendance by date
 * @route GET /api/v1/attendances/date/:date
 */
const getAttendanceByDate = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const attendances = await attendanceService.getAttendanceByDate(
        new Date(date),
        { page: parsedPage, limit: parsedLimit }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, attendances, "Attendance by date fetched successfully"));
});

/**
 * Get student attendance statistics
 * @route GET /api/v1/attendances/stats/student/:studentId
 */
const getStudentAttendanceStats = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid student ID");
    }

    const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
    } : undefined;

    const stats = await attendanceService.getStudentAttendanceStats(studentId, dateRange);

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Student attendance statistics fetched successfully"));
});

/**
 * Get class attendance statistics
 * @route GET /api/v1/attendances/stats/class/:classId
 */
const getClassAttendanceStats = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { date } = req.query;

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid class ID");
    }

    const stats = await attendanceService.getClassAttendanceStats(
        classId,
        date ? new Date(date as string) : undefined
    );

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Class attendance statistics fetched successfully"));
});

/**
 * Mark bulk attendance for a class
 * @route POST /api/v1/attendances/mark-bulk
 */
const markBulkAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { classId, date, attendanceRecords, markedBy } = req.body;

    const attendances = await attendanceService.markBulkAttendance(
        classId,
        new Date(date),
        attendanceRecords,
        markedBy
    );

    return res
        .status(201)
        .json(new ApiResponse(201, attendances, "Bulk attendance marked successfully"));
});

export {
    getAllAttendances,
    createAttendance,
    getAttendanceById,
    updateAttendanceById,
    deleteAttendanceById,
    deleteBulkAttendances,
    createBulkAttendances,
    getAttendanceByStudent,
    getAttendanceByClass,
    getAttendanceByDate,
    getStudentAttendanceStats,
    getClassAttendanceStats,
    markBulkAttendance,
};
