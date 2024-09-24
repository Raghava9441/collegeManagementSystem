import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Attendance } from "../models/attendance.models";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { ApiError } from "../utils/ApiError";
import { Organization } from "../models/organization.models";
import { Student } from "../models/student.models";
import { Class } from "../models/class.models";
import { Teacher } from "../models/teacher.model";
import { asyncHandler } from "../utils/asyncHandler";
import * as XLSX from 'xlsx';


const getAllAttendances = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const productAggregate = Attendance.aggregate([{ $match: {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const attendances = await Attendance.aggregatePaginate(
        productAggregate,
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalAttendances",
                docs: "attendances",
            },
        }),
    )

    return res
        .status(200)
        .json(new ApiResponse(200, attendances, "Attendances are fetched successfully"));
}

const createAttendance = async (req: Request, res: Response) => {
    const { studentId, classId, date, status, remarks, markedBy } = req.body;

    if (!studentId || !classId || !date || !status || !remarks || !markedBy) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
        return res.status(404).json(new ApiError(404, "Student not found"));
    }

    const existingClass = await Class.findById(classId);
    if (!existingClass) {
        return res.status(404).json(new ApiError(404, "Class not found"));
    }

    const existingTeacher = await Teacher.findById(markedBy);
    if (!existingTeacher) {
        return res.status(404).json(new ApiError(404, "Teacher not found"));
    }

    const attendance = await Attendance.create({
        studentId,
        classId,
        date,
        status,
        remarks,
        markedBy,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, attendance, "Attendance is created successfully"));
}

const getAttendanceById = async (req: Request, res: Response) => {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
        return res
            .status(404)
            .json(new ApiError(404, "Attendance is not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, attendance, "Attendance is fetched successfully"));
}

const updateAttendanceById = async (req: Request, res: Response) => {
    const { studentId, classId, date, status, remarks, markedBy } = req.body;
    const { attendanceId } = req.params;

    const attendance = Attendance.findById(attendanceId);

    if (!attendance) {
        return res
            .status(404)
            .json(new ApiError(404, "Attendance is not found"));
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(attendanceId, {
        $set: {
            studentId,
            classId,
            date,
            status,
            remarks,
            markedBy,
        },
    }, {
        new: true,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAttendance, "Attendance is created successfully"));
}

const deleteAttendanceById = async (req: Request, res: Response) => {

    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
        return res
            .status(404)
            .json(new ApiError(404, "Attendance is not found"));
    }

    await Attendance.deleteOne({ _id: attendanceId });
    return res.status(200).json(new ApiResponse(200, "attendance is deleted successfully", "Attendance is deleted successfully"));
}

const deleteBulkAttendances = async (req: Request, res: Response) => {

    const { attendanceIds } = req.body;

    if (!attendanceIds || !Array.isArray(attendanceIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of attendance ids"));
    }

    await Attendance.deleteMany({ _id: { $in: attendanceIds } });

    return res.status(200).json(new ApiResponse(200, "attendances are deleted successfully", "Attendances are deleted successfully"));
}
const createBulkAttendances = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    // Parse the Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const attendancesData = XLSX.utils.sheet_to_json(sheet);

    // Validate and prepare attendances for creation
    const attendances = attendancesData.map((data: any) => {
        const { studentId, classId, date, status, remarks, markedBy } = data;

        if (!studentId || !classId || !date || !status || !remarks || !markedBy) {
            throw new ApiError(400, `Missing required fields for attendance: ${studentId}`);
        }

        return {
            studentId,
            classId,
            date,
            status,
            remarks,
            markedBy,
        };
    });

    // Bulk insert attendances
    const createdAttendances = await Attendance.insertMany(attendances);

    return res.status(200).json(new ApiResponse(200, createdAttendances, "Attendances are created successfully"));
})



export {
    getAllAttendances,
    createAttendance,
    getAttendanceById,
    updateAttendanceById,
    deleteAttendanceById,
    deleteBulkAttendances,
    createBulkAttendances
}