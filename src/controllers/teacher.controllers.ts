import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Teacher } from "../models/teacher.model";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { User } from "../models/user.models";
import { UserRolesEnum } from "../constants";
import { ApiError } from "../utils/ApiError";
import { Organization } from "../models/organization.models";

const getAllTeachers = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const productAggregate = Teacher.aggregate([{ $match: {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const teachers = await Teacher.aggregatePaginate(
        productAggregate,
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalTeachers",
                docs: "teachers",
            },
        }),
    )

    return res
        .status(200)
        .json(new ApiResponse(200, teachers, "Teachers are fetched successfully"));
}

const createTeacher = async (req: Request, res: Response) => {

    const { description, courseId, teacherId, organizationId, subjects, qualifications, experience, officeHours, researchInterests, publications, professionalMemberships, coursesTaught, performanceReviews, specialResponsibilities, teachingPhilosophy, userId } = req.body;
    console.log("organizationId:", organizationId)
    console.log("userId:", userId)
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

    return res
        .status(200)
        .json(new ApiResponse(200, teacher, "Teacher is created successfully"));
}

const getTeacherById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is fetched successfully", "Teacher is fetched successfully"));
}

const updateTeacherById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is updated successfully", "Teacher is updated successfully"));
}

const deleteTeacherById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is deleted successfully", "Teacher is deleted successfully"));
}

const deleteBulkTeachers = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teachers are deleted successfully", "Teachers are deleted successfully"));
}

const getTeacherBySubject = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is fetched successfully", "Teacher is fetched successfully"));
}


export {
    getAllTeachers,
    createTeacher,
    getTeacherById,
    updateTeacherById,
    deleteTeacherById,
    deleteBulkTeachers,
    getTeacherBySubject
}