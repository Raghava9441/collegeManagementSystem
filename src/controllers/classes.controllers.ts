import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";


const getAllClasses = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "all classes are fetched successfully", "Classes are fetched successfully"));
}

const createClass = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "class is created successfully", "Class is created successfully"));
}
const createBulkClasses = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "classes are created successfully", "Classes are created successfully"));
}

const getClassById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "class is fetched successfully", "Class is fetched successfully"));
}

const updateClassById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "class is updated successfully", "Class is updated successfully"));
}

const deleteClassById = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "class is deleted successfully", "Class is deleted successfully"));
}

const deleteBulkClasses = async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "classes are deleted successfully", "Classes are deleted successfully"));
}


export {
    getAllClasses,
    createClass,
    getClassById,
    updateClassById,
    deleteClassById,
    deleteBulkClasses,
    createBulkClasses
}