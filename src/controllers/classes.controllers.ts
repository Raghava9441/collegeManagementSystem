import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "@utils/ApiError";
import { UserDocument } from "../@types/express";
import { classesService } from "@services/classes.service";
import { Organization } from "@models/organization.models";
import mongoose from "mongoose";
import { Course } from "@models/course.models";
import { Teacher } from "@models/teacher.model";
import { asyncHandler } from "@utils/asyncHandler";

const getAllClasses = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const { organizationId } = req.user as UserDocument

    if (!organizationId) {
        throw new ApiError(400, null, "get all courses failed", undefined, [{ msg: "Please provide organization id" }])
    }
    const classes = await classesService.getClassesPaginate(parsedPage, parsedLimit, organizationId);
    if (!classes) {
        throw new ApiError(404, null, "Classes are not found", undefined, [{ msg: "Classes are not found" }])
    }

    return res
        .status(200)
        .json(new ApiResponse(200, classes, "Classes are fetched successfully"));

})

const createClass = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId, name, description, courseId, teacherId, studentsEnrolled, classTeacherId, supervisorId, academicYear, departmentId, schedule, classroom, credits, maxCapacity, currentEnrollment } = req.body;
    const requiredFields = [
        "organizationId",
        "name",
        "description",
        "courseId",
        "teacherId",
        "studentsEnrolled",
        "classTeacherId",
        "supervisorId",
        "academicYear",
        "departmentId",
        "schedule",
        "classroom",
        "credits",
        "maxCapacity",
        "currentEnrollment"
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        throw new ApiError(400, null, "create class failed", undefined, [{ msg: `Please provide all the required fields: ${missingFields.join(', ')}` }])
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, null, "create class failed", undefined, [{ msg: "Please provide user id" }])
    }

    const existingOrganization = await Organization.findById(organizationId);

    if (!existingOrganization) {
        throw new ApiError(404, null, "Organization not found", undefined, [{ msg: "Organization not found" }])
    }
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
        throw new ApiError(404, null, "Course not found", undefined, [{ msg: "Course not found" }])
    }
    const existingTeacher = await Teacher.findById(teacherId);

    if (!existingTeacher) {
        throw new ApiError(404, null, "Teacher not found", undefined, [{ msg: "Teacher not found" }])
    }

    const classItem = await classesService.createClass({
        name,
        description,
        courseId,
        classTeacherId,
        supervisorId,
        academicYear,
        departmentId,
        schedule,
        classroom,
        credits,
        maxCapacity,
        currentEnrollment,
        organizationId,
        createdBy: new mongoose.Types.ObjectId(userId)
    });

    if (!classItem) {
        throw new ApiError(400, null, "Class is not created", undefined, [{ msg: "Class is not created" }])
    }

    return res
        .status(200)
        .json(new ApiResponse(200, classItem, "Class is created successfully"));
})


const getClassById = asyncHandler(async (req: Request, res: Response) => {

    const { classId } = req.params;

    if (!classId) {
        throw new ApiError(400, null, "get class by id failed", undefined, [{ msg: "Please provide class id" }])
    }

    const classItem = await classesService.getClassById(classId);

    if (!classItem) {
        throw new ApiError(404, null, "Class is not found", undefined, [{ msg: "Class is not found" }])
    }

    return res
        .status(200)
        .json(new ApiResponse(200, classItem, "Class is fetched successfully"));

})

const updateClassById = asyncHandler(async (req: Request, res: Response) => {

    const { classId } = req.params;
    const userId = req.user?.id
    const { name, description, courseId, teacherId, studentsEnrolled, classTeacherId, supervisorId, academicYear, departmentId, schedule, classroom, credits, maxCapacity, currentEnrollment } = req.body;
    if (!classId) {
        throw new ApiError(400, null, "update class by id failed", undefined, [{ msg: "Please provide class id" }])
    }
    if (!userId) {
        throw new ApiError(400, null, "update class by id failed", undefined, [{ msg: "Please provide user id" }])
    }

    const existingClass = await classesService.getClassById(classId);

    if (!existingClass) {
        throw new ApiError(404, null, "Class is not found", undefined, [{ msg: "Class is not found" }])
    }

    const updatedClass = await classesService.updateClassById(classId, {
        name,
        description,
        courseId,
        classTeacherId,
        supervisorId,
        academicYear,
        departmentId,
        schedule,
        classroom,
        credits,
        maxCapacity,
        currentEnrollment,
        createdBy: new mongoose.Types.ObjectId(userId)
    });

    if (!updatedClass) {
        throw new ApiError(404, null, "Class is not found", undefined, [{ msg: "Class is not found" }])
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedClass, "Class is updated successfully"));
})

const deleteClassById = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;

    if (!classId) {
        throw new ApiError(400, null, "delete class by id failed", undefined, [{ msg: "Please provide class id" }])
    }

    const classItem = await classesService.getClassById(classId);

    if (!classItem) {
        throw new ApiError(404, null, "Class is not found", undefined, [{ msg: "Class is not found" }])
    }

    await classesService.deleteClassById(classId);

    return res.status(200).json(new ApiResponse(200, "Class is deleted successfully", "Class is deleted successfully"));
})
const createBulkClasses = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "classes are created successfully", "Classes are created successfully"));
})

const deleteBulkClasses = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "classes are deleted successfully", "Classes are deleted successfully"));
})


export {
    getAllClasses,
    createClass,
    getClassById,
    updateClassById,
    deleteClassById,
    deleteBulkClasses,
    createBulkClasses
}