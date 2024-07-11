import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";


const getAllStudents = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "all students are fetched successfully", "Students are fetched successfully"));
}

const createStudent = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "student is created successfully", "Student is created successfully"));
}

const getStudentById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "student is fetched successfully", "Student is fetched successfully"));
}

const updateStudentById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "student is updated successfully", "Student is updated successfully"));
}

const deleteStudentById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "student is deleted successfully", "Student is deleted successfully"));
}

const deleteStudentBulk = async (req: Request, res: Response) => {
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