import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Department } from "../models/Department.models";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { ApiError } from "../utils/ApiError";
import { Organization } from "../models/organization.models";

const getAllDepartments = async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const productAggregate = Department.aggregate([{ $match: {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const departments = await Department.aggregatePaginate(
        productAggregate,
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalDepartments",
                docs: "departments",
            },
        }),
    )

    return res
        .status(200)
        .json(new ApiResponse(200, departments, "Departments are fetched successfully"));
}

const createDepartment = async (req: Request, res: Response) => {
    const { name, description, organizationId, courses, teachers, classes } = req.body;

    if (!name || !description || !organizationId || !courses || !teachers || !classes) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    const existingOrganization = await Organization.findById(organizationId);
    if (!existingOrganization) {
        return res.status(404).json(new ApiError(404, "Organization not found"));
    }

    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
        return res.status(409).json(new ApiError(409, "Department with the same name already exists"));
    }

    const department = await Department.create({
        name,
        description,
        organizationId,
        courses,
        teachers,
        classes,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, department, "Department is created successfully"));
}

const getDepartmentById = async (req: Request, res: Response) => {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);

    if (!department) {
        return res
            .status(404)
            .json(new ApiError(404, "Department is not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, department, "Department is fetched successfully"));
}

const updateDepartmentById = async (req: Request, res: Response) => {
    const { name, description, organizationId, courses, teachers, classes } = req.body;
    const { departmentId } = req.params;

    const department = Department.findById(departmentId);

    if (!department) {
        return res
            .status(404)
            .json(new ApiError(404, "Department is not found"));
    }

    const updatedDepartment = await Department.findByIdAndUpdate(departmentId, {
        $set: {
            name,
            description,
            organizationId,
            courses,
            teachers,
            classes,
        },
    }, {
        new: true,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDepartment, "Department is created successfully"));
}

const deleteDepartmentById = async (req: Request, res: Response) => {

    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);

    if (!department) {
        return res
            .status(404)
            .json(new ApiError(404, "Department is not found"));
    }

    await Department.deleteOne({ _id: departmentId });
    return res.status(200).json(new ApiResponse(200, "department is deleted successfully", "Department is deleted successfully"));
}

const deleteBulkDepartments = async (req: Request, res: Response) => {

    const { departmentIds } = req.body;

    if (!departmentIds || !Array.isArray(departmentIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of department ids"));
    }

    await Department.deleteMany({ _id: { $in: departmentIds } });

    return res.status(200).json(new ApiResponse(200, "departments are deleted successfully", "Departments are deleted successfully"));
}

const createBulkDepartments = async (req: Request, res: Response) => {
    const { departmentIds } = req.body;

    if (!departmentIds || !Array.isArray(departmentIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of department ids"));
    }

    const departments = await Department.find({ _id: { $in: departmentIds } });

    if (!departments) {
        return res
            .status(404)
            .json(new ApiError(404, "Departments not found"));
    }

    await Department.deleteMany({ _id: { $in: departmentIds } });

    return res.status(200).json(new ApiResponse(200, "departments are deleted successfully", "Departments are deleted successfully"));
}


export {
    getAllDepartments,
    createDepartment,
    getDepartmentById,
    updateDepartmentById,
    deleteDepartmentById,
    deleteBulkDepartments,
    createBulkDepartments
}