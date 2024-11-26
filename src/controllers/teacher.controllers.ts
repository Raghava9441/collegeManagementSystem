import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Teacher } from "../models/teacher.model";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { IUser, User } from "../models/user.models";
import { UserRolesEnum } from "../constants";
import { ApiError } from "../utils/ApiError";
import { Organization } from "../models/organization.models";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";


const getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    if (!req.user) {
        return new ApiResponse(403, [], "Access denied");
    }

    const teachers = await Teacher.aggregatePaginate(
        req.user.role === 'ADMIN' ?
            Teacher.aggregate([{ $match: {} }, { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } }, { $unwind: '$userDetails' }, { $project: { _id: 1, name: '$userDetails.fullname', email: '$userDetails.email', phone: '$userDetails.phone', userId: 1, organizationId: 1, departments: 1, subjects: 1, qualifications: 1, experience: 1, officeHours: 1, researchInterests: 1, publications: 1, professionalMemberships: 1, coursesTaught: 1, performanceReviews: 1, specialResponsibilities: 1, teachingPhilosophy: 1 } }]) :
            Teacher.aggregate([{ $match: { organizationId: req.user.organizationId } }, { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } }, { $unwind: '$userDetails' }, { $project: { _id: 1, name: '$userDetails.fullname', email: '$userDetails.email', phone: '$userDetails.phone', userId: 1, organizationId: 1, departments: 1, subjects: 1, qualifications: 1, experience: 1, officeHours: 1, researchInterests: 1, publications: 1, professionalMemberships: 1, coursesTaught: 1, performanceReviews: 1, specialResponsibilities: 1, teachingPhilosophy: 1 } }]),
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalTeachers",
                docs: "teachers",
            },
        }),
    );

    return res
        .status(200)
        .json(new ApiResponse(200, teachers, "Teachers are fetched successfully"));
})

const createTeacher = asyncHandler(async (req: Request, res: Response) => {
    //create teacher if the user is admin
    console.log(req.user)
    if (req.user && req.user.role === 'ADMIN') {
        console.log("object")
        const { description, courseId, teacherId, organizationId, subjects, qualifications, experience, officeHours, researchInterests, publications, professionalMemberships, coursesTaught, performanceReviews, specialResponsibilities, teachingPhilosophy, userId } = req.body;
        // console.log("organizationId:", organizationId)
        console.log(subjects)
        // console.log("userId:", userId)
        //check only mandatory fields are there or not 
        if (!organizationId || !userId) {
            return res
                .status(400)
                .json(new ApiError(400, "Please provide all the required fields"));
        }

        const existingOrganization = await Organization.findById(organizationId);
        if (!existingOrganization) {
            return res.status(404).json(new ApiError(404, "Organization not found"));
        }

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        if (existingUser.role !== UserRolesEnum.TEACHER) {
            return res.status(400).json(new ApiError(400, "User is not a teacher"));
        }

        const activeTeacher = await Teacher.findOne({ userId, organizationId });
        if (activeTeacher) {
            return res.status(409).json(new ApiError(409, "User is already an active teacher in this organization"));
        }

        const teacher = await Teacher.create({
            courseId,
            userId,
            organizationId,
            subjects,
            qualifications,
            experience,
            officeHours,
            researchInterests,
            publications,
            professionalMemberships,
            coursesTaught,
            performanceReviews,
            specialResponsibilities,
            teachingPhilosophy,
        });

        //update the user object
        const userdetails = await User.findByIdAndUpdate(userId, {
            $set: {
                "teacherId": teacher._id
            }
        });
        console.log("object", userdetails)

        return res
            .status(200)
            .json(new ApiResponse(200, teacher, "Teacher is created successfully"));
    } else {
        return res.status(403).json(new ApiResponse(403, [], "Access denied"));
    }
})

const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is fetched successfully", "Teacher is fetched successfully"));
})

const updateTeacherById = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is updated successfully", "Teacher is updated successfully"));
})

const deleteTeacherById = asyncHandler(async (req: Request, res: Response) => {
    if (req.user && req.user.role === 'ADMIN') {
        const { teacherId } = req.params;
        if (!teacherId) {
            return res
                .status(400)
                .json(new ApiError(400, "Please provide a teacher id"));
        }

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res
                .status(400)
                .json(new ApiError(400, "Please provide a valid teacher id"));
        }

        const existingTeacher = await Teacher.findById(teacherId);
        if (!existingTeacher) {
            return res
                .status(404)
                .json(new ApiError(404, "Teacher is not found"));
        }
        const existingOrganization = await Organization.findById(existingTeacher.organizationId);

        if (!existingOrganization) {
            return res
                .status(404)
                .json(new ApiError(404, "Organization is not found"));
        }
        await Teacher.deleteOne({ _id: teacherId });

        return res.status(200).json(new ApiResponse(200, "teacher is deleted successfully", "Teacher is deleted successfully"));

    } else {
        return res.status(403).json(new ApiResponse(403, [], "Access denied"));
    }
})

const deleteBulkTeachers = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teachers are deleted successfully", "Teachers are deleted successfully"));
})

const getTeacherBySubject = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is fetched successfully", "Teacher is fetched successfully"));
})


export {
    getAllTeachers,
    createTeacher,
    getTeacherById,
    updateTeacherById,
    deleteTeacherById,
    deleteBulkTeachers,
    getTeacherBySubject
}