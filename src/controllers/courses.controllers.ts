import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { courseService } from "../services/course.service";
import { Organization } from "../models/organization.models";
import { ApiError } from "../utils/ApiError";
import { Course } from "../models/course.models";
import { asyncHandler } from "../utils/asyncHandler";
import { UserDocument } from "../@types/express";


const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, } = req.query;
    // const { organizationId } = req.params;
    const { organizationId } = req.user as UserDocument
    
    //validate the organization id
    if (!organizationId) {
        throw new ApiError(400, null, "get all courses failed", undefined, [{ msg: "Please provide organization id" }])
    }
    //check organization is exist or not 
    const existingOrganization = await Organization.findById(organizationId);
    if (!existingOrganization) {
        throw new ApiError(404, null, "get all courses failed", undefined, [{ msg: "Organization not found" }]);
    }
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;
    const courses = await courseService.getCoursesPaginate(parsedPage, parsedLimit, organizationId);
    if (!courses) {
        throw new ApiError(404, null, "Courses are not found", undefined, [{ msg: "Courses are not found" }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, courses, "Courses are fetched successfully"));
})

const getCourseById = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    //validate the course id
    if (!courseId) {
        throw new ApiError(400, null, "get course by id failed", undefined, [{ msg: "Please provide course id" }]);
    }

    const course = await courseService.getCourseById(courseId);

    if (!course) {
        throw new ApiError(404, null, "Course is not found", undefined, [{ msg: "Course is not found" }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, course, "Course is fetched successfully"));
})

const updateCourseById = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    //validate the course id
    if (!courseId) {
        throw new ApiError(400, null, "update course by id failed", undefined, [{ msg: "Please provide course id" }]);
    }

    const course = await courseService.getCourseById(courseId);

    if (!course) {
        throw new ApiError(404, null, "Course is not found", undefined, [{ msg: "Course is not found" }]);
    }

    const updatedCourse = await courseService.updateCourseById(courseId, req.body);

    if (!updatedCourse) {
        throw new ApiError(404, null, "Course is not found", undefined, [{ msg: "Course is not found" }])
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedCourse, "Course is updated successfully"));
})

const deleteCourseById = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    //validate the course id
    if (!courseId) {
        throw new ApiError(400, null, "delete course by id failed", undefined, [{ msg: "Please provide course id" }])
    }

    const course = await courseService.getCourseById(courseId);

    if (!course) {
        throw new ApiError(404, null, "Course is not found", undefined, [{ msg: "Course is not found" }]);
    }

    await courseService.deleteCourseById(courseId);

    return res.status(200).json(new ApiResponse(200, "course is deleted successfully", "Course is deleted successfully"));
})

const deleteBulkCourses = asyncHandler(async (req: Request, res: Response) => {
    const { courseIds } = req.body;
    //validate the course ids
    if (!courseIds || !Array.isArray(courseIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of course ids"));
    }

    await courseService.deleteBulkCourses(courseIds);

    return res.status(200).json(new ApiResponse(200, "courses are deleted successfully", "Courses are deleted successfully"));
})

const createCourse = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, teacherIds, organizationId, subjectsIds, startDate, endDate, schedule, credits, prerequisites, location, fee, textbooks, syllabus, assignments, gradingScheme, feedback, resources } = req.body;
    console.log("organizationId",organizationId)
    const existingOrganization = await Organization.findById(organizationId);
    if (!existingOrganization) {
        throw new ApiError(404, null, "Course creation failed", undefined, [{ msg: "Organization not found" }]);
    }

    const existingCourse = await courseService.findOne({ name });
    if (existingCourse) {
        throw new ApiError(409, null, 'Course creation failed', undefined, [{ msg: 'Course with the same name already exists' }]);
    }

    let response = await courseService.createCourse(req.body);

    if (!response) {
        throw new ApiError(400, null, 'Course creation failed', undefined, [{ msg: 'something went wrong' }]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Course is created successfully"));

})

const createBulkCourses = async (req: any, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "courses are created successfully", "Courses are created successfully"));
}


export {
    getAllCourses,
    createCourse,
    getCourseById,
    updateCourseById,
    deleteCourseById,
    deleteBulkCourses,
    createBulkCourses
}   