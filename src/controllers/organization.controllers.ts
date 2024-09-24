import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Organization } from "../models/organization.models";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { ApiError } from "../utils/ApiError";
import * as XLSX from 'xlsx';

const getAllOrganizations = asyncHandler(async (req: Request, res: Response) => {
    // throw new ApiError(400, `Missing required fields for organization`)

    const { page = 1, limit = 10 } = req.query;

    const productAggregate = Organization.aggregate([{ $match: {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const organizations = await Organization.aggregatePaginate(
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
        .json(new ApiResponse(200, organizations, "Organizations are fetched successfully"));
})

const createOrganization = asyncHandler(async (req: Request, res: Response) => {

    const { name, category, number, address, createdBy, logo, website, contactEmail, contactPhone, establishedDate, description, socialLinks } = req.body;

    if (!name || !category || !number || !website || !contactEmail || !contactPhone) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    const existingOrganization = await Organization.findOne({
        $or: [
            { name },
            { website },
            { contactEmail }
        ]
    });

    if (existingOrganization) {
        return res.status(409).json(new ApiError(409, "An organization with the same name, website, or contact email already exists"));
    }

    const organization = await Organization.create({
        name,
        category,
        number,
        address,
        createdBy,
        logo,
        website,
        contactEmail,
        contactPhone,
        establishedDate,
        description,
        socialLinks,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, organization, "Organization is created successfully"));

})

const createBulkOrganizations = asyncHandler(async (req: Request, res: Response) => {

    if (!req.file || !req.file.buffer) {
        return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    // Parse the Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const organizationsData = XLSX.utils.sheet_to_json(sheet);

    // Validate and prepare organizations for creation
    const organizations = organizationsData.map((data: any) => {
        const { name, category, number, address, createdBy, logo, website, contactEmail, contactPhone, establishedDate, description, socialLinks } = data;

        if (!name || !category || !number || !website || !contactEmail || !contactPhone) {
            throw new ApiError(400, `Missing required fields for organization: ${name}`);
        }

        return {
            name,
            category,
            number,
            address,
            createdBy,
            logo,
            website,
            contactEmail,
            contactPhone,
            establishedDate,
            description,
            socialLinks,
        };
    });

    // Bulk insert organizations
    const createdOrganizations = await Organization.insertMany(organizations);

    return res.status(200).json(new ApiResponse(200, createdOrganizations, "Organizations are created successfully"));
});

const deleteOrganizationById = asyncHandler(async (req: Request, res: Response) => {

    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
        return res
            .status(404)
            .json(new ApiError(404, "Organization is not found"));
    }

    await Organization.deleteOne({ _id: organizationId });
    return res.status(200).json(new ApiResponse(200, "organization is deleted successfully", "Organization is deleted successfully"));
});

const getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
        return res
            .status(404)
            .json(new ApiError(404, "Organization is not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, organization, "Organization is fetched successfully"));
});

const updateOrganizationById = asyncHandler(async (req: Request, res: Response) => {

    const { name, category, number, address, createdBy, logo, website, contactEmail, contactPhone, establishedDate, description, socialLinks } = req.body;
    const { organizationId } = req.params;

    const organization = Organization.findById(organizationId);

    if (!organization) {
        return res
            .status(404)
            .json(new ApiError(404, "Organization is not found"));
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(organizationId, {
        $set: {
            name,
            category,
            number,
            address,
            createdBy,
            logo,
            website,
            contactEmail,
            contactPhone,
            establishedDate,
            description,
            socialLinks,
        },
    }, {
        new: true,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrganization, "Organization is created successfully"));
});

const deleteBulkOrganizations = asyncHandler(async (req: Request, res: Response) => {

    const { organizationIds } = req.body;

    if (!organizationIds || !Array.isArray(organizationIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of organization ids"));
    }

    await Organization.deleteMany({ _id: { $in: organizationIds } });

    return res.status(200).json(new ApiResponse(200, "organizations are deleted successfully", "Organizations are deleted successfully"));
});

export {
    getAllOrganizations,
    createOrganization,
    createBulkOrganizations,
    deleteOrganizationById,
    getOrganizationById,
    updateOrganizationById,
    deleteBulkOrganizations
}