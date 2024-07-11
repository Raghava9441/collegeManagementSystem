import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";


const getAllTeachers = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "all teachers are fetched successfully", "Teachers are fetched successfully"));
}

const createTeacher = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "teacher is created successfully", "Teacher is created successfully"));
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