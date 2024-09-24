import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Student } from "../models/student.models";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { ApiError } from "../utils/ApiError";
import { Organization } from "../models/organization.models";
import { User } from "../models/user.models";
import { UserRolesEnum } from "../constants";
import { Parent } from "../models/parent.model";
import { Teacher } from "../models/teacher.model";
import { asyncHandler } from "../utils/asyncHandler";


const getAllStudents = asyncHandler(async (req: any, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const students = await Student.aggregatePaginate(
        req.user && req.user.role === 'ADMIN' ?
            Student.aggregate([{ $match: {} }]) :
            Student.aggregate([{ $match: { organizationId: req.user.organizationId } }]),
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
        .json(new ApiResponse(200, students, "Students are fetched successfully"));
})

const createStudent = asyncHandler(async (req: Request, res: Response) => {
    const { userId, organizationId, parentIds, courseIds, dateOfBirth, emergencyContacts, address, phoneNumber, email, enrollmentDate, graduationDate } = req.body;

    if (!organizationId || !userId) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    // Check if the organization exists
    const existingOrganization = await Organization.findById(organizationId);
    if (!existingOrganization) {
        return res.status(404).json(new ApiError(404, "Organization not found"));
    }

    // Check if the user exists and is a student
    const existingUser = await User.findById(userId);
    if (!existingUser) {
        return res.status(404).json(new ApiError(404, "User not found"));
    }
    if (existingUser.role !== UserRolesEnum.STUDENT) {
        return res.status(400).json(new ApiError(400, "User is not a Student"));
    }

    // Check if the user is already an active student in this organization
    const activeStudent = await Student.findOne({ userId, organizationId });
    if (activeStudent) {
        return res.status(409).json(new ApiError(409, "User is already an active student in this organization"));
    }

    // Create the student record
    const student = await Student.create({
        userId,
        organizationId,
        parentIds, // More descriptive variable name
        courseIds,
        dateOfBirth,
        address,
        phoneNumber,
        email,
        enrollmentDate,
        graduationDate,
        emergencyContacts
    });

    // If parentIds are provided, update the student and parent records
    if (Array.isArray(parentIds) && parentIds.length) {
        student.parentIds = parentIds;
        await student.save();

        // Update the parents' childIds
        await Parent.updateMany(
            { _id: { $in: parentIds } }, // Filter the parents
            { $push: { childrenIds: student._id } } // Add studentId to the parents
        );
    }

    return res
        .status(201) // Status 201 for successful creation
        .json(new ApiResponse(201, student, "Student is created successfully"));
});


const getStudentById = asyncHandler(async (req: Request, res: Response) => {

    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
        return res
            .status(404)
            .json(new ApiError(404, "Student is not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Student is fetched successfully"));
})

const updateStudentById = asyncHandler(async (req: Request, res: Response) => {

    const { studentId } = req.params;

    const { userId, organizationId, parentId, courseIds, dateOfBirth, emergencyContacts, address, phoneNumber, email, enrollmentDate, graduationDate } = req.body;

    const student = Student.findById(studentId);

    if (!student) {
        return res
            .status(404)
            .json(new ApiError(404, "Student is not found"));
    }

    const updatedStudent = await Student.findByIdAndUpdate(studentId, {
        $set: {
            userId,
            organizationId,
            parentId,
            courseIds,
            dateOfBirth,
            address,
            phoneNumber,
            email,
            enrollmentDate,
            graduationDate,
            emergencyContacts
        },
    }, {
        new: true,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedStudent, "Student is created successfully"));
})

const deleteStudentById = asyncHandler(async (req: any, res: Response) => {
    const { organizationId, teacherId } = req.user;
    const { studentId } = req.params;

    if (!organizationId || !studentId) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    const existingOrganization = await Organization.findById(organizationId);

    if (!existingOrganization) {
        return res
            .status(404)
            .json(new ApiError(404, "Organization is not found"));
    }

    const existingTeacher = await Teacher.findById(teacherId);

    if (!existingTeacher) {
        return res
            .status(404)
            .json(new ApiError(404, "Teacher is not found"));
    }

    // Check if the student is enrolled in the course
    // const studentCourses = await Student.find({ _id: studentId, organizationId });
    // if (studentCourses.length) {
    //     return res
    //         .status(400)
    //         .json(new ApiError(400, "Student is already enrolled in a course"));
    // }

    const student = await Student.findOne({ _id: studentId, organizationId });

    if (!student) {
        return res
            .status(404)
            .json(new ApiError(404, "Student is not found"));
    }

    if (!student) {
        return res
            .status(404)
            .json(new ApiError(404, "Student is not found"));
    }

    await Student.deleteOne({ _id: studentId });

    return res.status(200).json(new ApiResponse(200, "student is deleted successfully", "Student is deleted successfully"));
})

const deleteStudentBulk = asyncHandler(async (req: Request, res: Response) => {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of student ids"));
    }

    await Student.deleteMany({ _id: { $in: studentIds } });

    return res.status(200).json(new ApiResponse(200, "students are deleted successfully", "Students are deleted successfully"));
})

export {
    getAllStudents,
    createStudent,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    deleteStudentBulk
}