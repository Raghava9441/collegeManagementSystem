import { Exam } from '../models/exam.models';
import { ObjectId } from 'mongodb';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { getMongoosePaginationOptions } from '../utils/healpers';
import { isValidObjectId } from 'mongoose';


const getAllExams = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    console.log(req.user)
    const { role, organizationId } = req.user;

    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    const productAggregate = Exam.aggregate([{ $match: role !== 'ADMIN' ? { _id: new ObjectId(organizationId) } : {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;


    const exams = await Exam.aggregatePaginate(
        productAggregate,
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalOrganizations",
                docs: "organizations",
            },
        }),
    )

    return res
        .status(200)
        .json(new ApiResponse(200, exams, "Exams are fetched successfully"));
});

const createExam = asyncHandler(async (req, res) => {
    const { name, description, subjectId, courseId, classId, teacherId, duration, totalMarks, examType, startDate, endDate, schedule } = req.body;

    if (!name || !description || !subjectId || !courseId || !classId || !teacherId || !duration || !totalMarks || !examType || !startDate || !endDate || !schedule) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    const exam = await Exam.create({
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
        .json(new ApiResponse(200, exam, "Exam is created successfully"));
});

const getExamById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid ID provided"));
    }

    const exam = await Exam.findById(id);

    if (!exam) {
        return res
            .status(404)
            .json(new ApiError(404, "Exam is not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, exam, "Exam is fetched successfully"));
});

const updateExam = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, subjectId, courseId, classId, teacherId, duration, totalMarks, examType, startDate, endDate, schedule } = req.body;

    if (!isValidObjectId(id)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid ID provided"));
    }

    const exam = await Exam.findById(id);

    if (!exam) {
        return res
            .status(404)
            .json(new ApiError(404, "Exam is not found"));
    }

    const updatedExam = await Exam.findByIdAndUpdate(id, {
        $set: {
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
        },
    }, {
        new: true,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedExam, "Exam is updated successfully"));
});

const deleteExam = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res
            .status(400)
            .json(new ApiError(400, "Invalid ID provided"));
    }

    const exam = await Exam.findById(id);

    if (!exam) {
        return res
            .status(404)
            .json(new ApiError(404, "exam is not found"));
    }

    await Exam.deleteOne({ _id: id });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Exam is deleted successfully"));
});

export {
    getAllExams,
    createExam,
    getExamById,
    updateExam,
    deleteExam
}