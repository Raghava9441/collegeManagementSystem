import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";


const getAllCourses = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "all courses are fetched successfully", "Courses are fetched successfully"));
}

const createCourse = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "course is created successfully", "Course is created successfully"));
}
const createBulkCourses = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "courses are created successfully", "Courses are created successfully"));
}
const getCourseById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "course is fetched successfully", "Course is fetched successfully"));
}

const updateCourseById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "course is updated successfully", "Course is updated successfully"));
}

const deleteCourseById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "course is deleted successfully", "Course is deleted successfully"));
}

const deleteBulkCourses = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "courses are deleted successfully", "Courses are deleted successfully"));
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