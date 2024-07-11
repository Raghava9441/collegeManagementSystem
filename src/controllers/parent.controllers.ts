

    import { Request, Response } from "express";
    import { ApiResponse } from "../utils/ApiResponse";
    
    
    const getAllParents = async (req: Request, res: Response) => {
        return res.status(200).json(new ApiResponse(200, "all parents are fetched successfully", "Parents are fetched successfully"));
    }
    
    const createParent = async (req: Request, res: Response) => {
        return res.status(200).json(new ApiResponse(200, "parent is created successfully", "Parent is created successfully"));
    }
    
    const getParentById = async (req: Request, res: Response) => {
        return res.status(200).json(new ApiResponse(200, "parent is fetched successfully", "Parent is fetched successfully"));
    }
    
    const updateParentById = async (req: Request, res: Response) => {
        return res.status(200).json(new ApiResponse(200, "parent is updated successfully", "Parent is updated successfully"));
    }
    
    const deleteParentById = async (req: Request, res: Response) => {
        return res.status(200).json(new ApiResponse(200, "parent is deleted successfully", "Parent is deleted successfully"));
    }
    
    const deleteBulkParents = async (req: Request, res: Response) => {
        return res.status(200).json(new ApiResponse(200, "parents are deleted successfully", "Parents are deleted successfully"));
    }
    
    
    export {
        getAllParents,
        createParent,
        getParentById,
        updateParentById,
        deleteParentById,
        deleteBulkParents
    }