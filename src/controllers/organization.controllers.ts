import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "all organizations are fetched successfully", "Organizations are fetched successfully"));
})

const createOrganization = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "organization is created successfully", "Organization is created successfully"));
})

const createBulkOrganizations = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "organizations are created successfully", "Organizations are created successfully"));
});

const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "organization is deleted successfully", "Organization is deleted successfully"));
});

const getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "organization is fetched successfully", "Organization is fetched successfully"));
});

const updateOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "organization is updated successfully", "Organization is updated successfully"));
});

const deleteBulkOrganizations = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "organizations are deleted successfully", "Organizations are deleted successfully"));
});

export {
    getAllOrganizations,
    createOrganization,
    createBulkOrganizations,
    getOrganizationById,
    updateOrganizationById,
    deleteBulkOrganizations
}