

import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { Parent } from "../models/parent.model";
import { getMongoosePaginationOptions } from "../utils/healpers";
import { Student } from "../models/student.models";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.models";
import { Organization } from "@models/organization.models";


const getAllParents = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const productAggregate = Parent.aggregate([{ $match: {} }, { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } }, { $unwind: '$userDetails' }, { $project: { _id: 1, name: '$userDetails.fullname', email: '$userDetails.email', phone: '$userDetails.phone', userId: 1, childrenIds: 1, organizationId: 1, relationshipToStudent: 1, dateOfBirth: 1, address: 1, phoneNumber: 1, emergencyContacts: 1, occupation: 1 } }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const Parents = await Parent.aggregatePaginate(
        productAggregate,
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalParents",
                docs: "parents",
            },
        }),
    )

    return res.status(200).json(new ApiResponse(200, Parents, "Parents are fetched successfully"));
})

const createParent = asyncHandler(async (req: Request, res: Response) => {
    const { userId, childrenIds, organizationId, relationshipToStudent, dateOfBirth, address, phoneNumber, email, emergencyContacts, occupation } = req.body;

    if (!userId || !childrenIds || !organizationId || !relationshipToStudent || !dateOfBirth || !address || !phoneNumber || !email || !emergencyContacts || !occupation) {
        return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }

    const child = await Student.findById(childrenIds);
    if (!child) {
        return res.status(400).json(new ApiResponse(400, null, "Child not found"));
    }

    //check if the parent is already exist
    const existingParent = await Parent.findOne({ userId });
    if (existingParent) {
        return res.status(400).json(new ApiResponse(400, null, "Parent already exists"));
    }
    //check if the child is already have a parent
    const childWithParent = await Student.findOne({ childrenIds: child._id });
    if (childWithParent) {
        return res.status(400).json(new ApiResponse(400, null, "Child already have a parent"));
    }
    //check if the parent is already have a child
    const parentWithChild = await Parent.findOne({ childrenIds: child._id });
    if (parentWithChild) {
        return res.status(400).json(new ApiResponse(400, null, "Parent already have a child"));
    }

    const parent = await Parent.create({ userId, childrenIds, organizationId, relationshipToStudent, dateOfBirth, address, phoneNumber, email, emergencyContacts, occupation });
    //update the user object
    await User.findByIdAndUpdate(userId, {
        $set: {
            "parentId": parent._id
        }
    });

    return res.status(200).json(new ApiResponse(200, parent, "Parent is created successfully"));
})

const getParentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    //check the id is valid or not
    if (!id) {
        return res.status(400).json(new ApiResponse(400, "Please provide a valid id", "Invalid id"));
    }
    //check the id is valid mongoose id or not
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new ApiResponse(400, "Invalid id", "Invalid id"));
    }
    //check for the organization also exist from the request.user
    if (!req.user || !req.user.organizationId) {
        return res.status(400).json(new ApiResponse(400, "User or organizationId is missing", "User or organizationId is missing"));
    }
    const existingOrganization = await Organization.findById(req.user.organizationId);

    if (!existingOrganization) {
        return res.status(404).json(new ApiResponse(404, "Organization not found", "Organization not found"));
    }
    const parent = await Parent.findOne({ _id: id, organizationId: req.user.organizationId });
    if (!parent) {
        return res.status(404).json(new ApiResponse(404, "Parent not found", "Parent not found"));
    }
    return res.status(200).json(new ApiResponse(200, parent, "Parent found successfully"));
})

const updateParentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    //check the id is valid or not
    if (!id) {
        return res.status(400).json(new ApiResponse(400, "Please provide a valid id", "Invalid id"));
    }
    //check the id is valid mongoose id or not
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new ApiResponse(400, "Invalid id", "Invalid id"));
    }
    //check for the organization also exist from the request.user
    if (!req.user || !req.user.organizationId) {
        return res.status(400).json(new ApiResponse(400, "User or organizationId is missing", "User or organizationId is missing"));
    }
    const existingOrganization = await Organization.findById(req.user.organizationId);

    if (!existingOrganization) {
        return res.status(404).json(new ApiResponse(404, "Organization not found", "Organization not found"));
    }
    const parent = await Parent.findOne({ _id: id, organizationId: req.user.organizationId });
    if (!parent) {
        return res.status(404).json(new ApiResponse(404, "Parent not found", "Parent not found"));
    }
    const { userId, childrenIds, organizationId, relationshipToStudent, dateOfBirth, address, phoneNumber, email, emergencyContacts, occupation } = req.body;
    if (!userId || !childrenIds || !organizationId || !relationshipToStudent || !dateOfBirth || !address || !phoneNumber || !email || !emergencyContacts || !occupation) {
        return res.status(400).json(new ApiResponse(400, "All fields are required", "All fields are required"));
    }
    const updatedParent = await Parent.findOneAndUpdate({ _id: id, organizationId: req.user.organizationId }, {
        $set: {
            userId,
            childrenIds,
            organizationId,
            relationshipToStudent,
            dateOfBirth,
            address,
            phoneNumber,
            email,
            emergencyContacts,
            occupation
        }
    }, {
        new: true
    });
    return res.status(200).json(new ApiResponse(200, updatedParent, "Parent is updated successfully"));
})

const deleteParentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    //check the id is valid or not
    if (!id) {
        return res.status(400).json(new ApiResponse(400, null, "Id is required"));
    }
    //check the id is valid mongoose id or not
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid id"));
    }
    const parent = await Parent.findByIdAndDelete(id);
    if (!parent) {
        return res.status(400).json(new ApiResponse(400, null, "Parent not found"));
    }
    return res.status(200).json(new ApiResponse(200, "parent is deleted successfully", "Parent is deleted successfully"));
})

const deleteBulkParents = asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, "parents are deleted successfully", "Parents are deleted successfully"));
})


export {
    getAllParents,
    createParent,
    getParentById,
    updateParentById,
    deleteParentById,
    deleteBulkParents
}