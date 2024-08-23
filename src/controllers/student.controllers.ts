import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Student } from "../models/student.models";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { ApiError } from "../utils/ApiError";
import { Organization } from "../models/organization.models";
import { User } from "../models/user.models";
import { UserRolesEnum } from "../constants";


const getAllStudents = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const productAggregate = Student.aggregate([{ $match: {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;


    //validations 
    //check for the organization id and studnet id 

    const students = await Student.aggregatePaginate(
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
        .json(new ApiResponse(200, students, "Students are fetched successfully"));

}

const createStudent = async (req: Request, res: Response) => {

    const { userId, organizationId, parentId, courseIds, dateOfBirth, emergencyContacts, address, phoneNumber, email, enrollmentDate, graduationDate } = req.body;

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
    if (existingUser.role !== UserRolesEnum.STUDENT) {
        return res.status(400).json(new ApiError(400, "User is not a Student"));
    }


    const activeStudent = await Student.findOne({ userId, organizationId });
    if (activeStudent) {
        return res.status(409).json(new ApiError(409, "User is already an active student in this organization"));
    }

    const student = await Student.create({
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
    });

    return res
        .status(200)
        .json(new ApiResponse(200, student, "Student is created successfully"));

}

const getStudentById = async (req: Request, res: Response) => {

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

}

const updateStudentById = async (req: Request, res: Response) => {

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
}

const deleteStudentById = async (req: Request, res: Response) => {

    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
        return res
            .status(404)
            .json(new ApiError(404, "Student is not found"));
    }

    await Student.deleteOne({ _id: studentId });
    return res.status(200).json(new ApiResponse(200, "student is deleted successfully", "Student is deleted successfully"));
}

const deleteStudentBulk = async (req: Request, res: Response) => {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of student ids"));
    }

    await Student.deleteMany({ _id: { $in: studentIds } });
    
    return res.status(200).json(new ApiResponse(200, "students are deleted successfully", "Students are deleted successfully"));
}

export {
    getAllStudents,
    createStudent,
    getStudentById,
    updateStudentById,
    deleteStudentById,
    deleteStudentBulk
}