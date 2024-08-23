import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IUser, User } from "../models/user.models";
import { asyncHandler } from "../utils/asyncHandler";
import * as XLSX from 'xlsx';
import { getMongoosePaginationOptions } from "../utils/healpers";
import logger from "../utils/logger";
import { uploadOncloudinary } from "../utils/cloudinary";
import fs from 'fs';

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {

    const { page = 1, limit = 10 } = req.query;

    const productAggregate = User.aggregate([{ $match: {} }]);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : 1;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 10;

    const users = await User.aggregatePaginate(
        productAggregate,
        getMongoosePaginationOptions({
            page: parsedPage,
            limit: parsedLimit,
            customLabels: {
                totalDocs: "totalUsers",
                docs: "users",
            },
        }),
    )

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users are fetched successfully"));
})

const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, fullname, avatar, coverImage, age, role, gender, organizationId, phone, address, status, dateOfBirth, biography, permissions, socialLinks, preferences, password, refreshToken } = req.body;

    if (!username || !email || !fullname || !avatar || !password || !role || !gender || !organizationId) {
        return res.status(400).json(new ApiError(400, "Please provide all the required fields"));
    }

    const existingUser = await User.findOne({
        $or: [
            { username },
            { email },
            { fullname }
        ]
    });

    if (existingUser) {
        return res.status(409).json(new ApiError(409, "A user with the same username, email, or fullname already exists"));
    }

    const user = await User.create({
        username,
        email,
        fullname,
        avatar,
        coverImage,
        age,
        role,
        gender,
        organizationId,
        phone,
        address,
        status,
        dateOfBirth,
        biography,
        permissions,
        socialLinks,
        preferences,
        password,
        refreshToken
    });

    return res.status(200).json(new ApiResponse(200, user, "User is created successfully"));
});


const createBulkUsers = asyncHandler(async (req: Request, res: Response) => {

    if (!req.file || !req.file.buffer) {
        return res.status(400).json(new ApiError(400, "No file uploaded"));
    }

    // Parse the Excel buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const usersData = XLSX.utils.sheet_to_json(sheet);

    // Validate and prepare users for creation
    const users = usersData.map((data: any) => {
        const { username, email, fullname, avatar, coverImage, age, role, gender, organizationId, phone, address, status, dateOfBirth, biography, permissions, socialLinks, preferences } = data;

        if (!username || !email || !fullname || !avatar || !coverImage || !age || !role || !gender || !organizationId || !phone || !address || !status || !dateOfBirth || !biography || !permissions || !socialLinks || !preferences) {
            throw new ApiError(400, `Missing required fields for user: ${username}`);
        }

        return {
            username,
            email,
            fullname,
            avatar,
            coverImage,
            age,
            role,
            gender,
            organizationId,
            phone,
            address,
            status,
            dateOfBirth,
            biography,
            permissions,
            socialLinks,
            preferences,
        };
    });

    // Bulk insert users
    const createdUsers = await User.insertMany(users);

    return res.status(200).json(new ApiResponse(200, createdUsers, "Users are created successfully"));
});

const deleteUserById = asyncHandler(async (req: Request, res: Response) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, "User is not found"));
    }

    await User.deleteOne({ _id: userId });
    return res.status(200).json(new ApiResponse(200, "user is deleted successfully", "User is deleted successfully"));
});

const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, "User is not found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User is fetched successfully"));
});

const updateUserById = asyncHandler(async (req: Request, res: Response) => {

    const { username, email, fullname, avatar, coverImage, age, role, gender, organizationId, phone, address, status, dateOfBirth, biography, permissions, socialLinks, preferences } = req.body;
    const { userId } = req.params;

    const user = User.findById(userId);

    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, "User is not found"));
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
        $set: {
            username,
            email,
            fullname,
            avatar,
            coverImage,
            age,
            role,
            gender,
            organizationId,
            phone,
            address,
            status,
            dateOfBirth,
            biography,
            permissions,
            socialLinks,
            preferences,
        },
    }, {
        new: true,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User is created successfully"));
});

const deleteBulkUsers = asyncHandler(async (req: Request, res: Response) => {

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide an array of user ids"));
    }

    await User.deleteMany({ _id: { $in: userIds } });

    return res.status(200).json(new ApiResponse(200, "users are deleted successfully", "Users are deleted successfully"));
});


const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user: IUser | null = await User.findOne({ email });
        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }
        // Check if password is correct
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json(new ApiError(401, "Invalid email or password"));
        }
        // Generate tokens
        const accessToken = user.genetateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // Return success response with user data and tokens
        return res.status(200).json(new ApiResponse(200, user, "User is logged in successfully"));

    } catch (error) {
        // Handle any unexpected errors
        console.error("Error logging in user:", error);
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
});

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    logger.info("Registering user");
    const { username, email, password, fullname, avatar, coverImage, age, role, gender, organizationId, phone, address, status, dateOfBirth, biography, permissions, socialLinks, preferences } = req.body;

    if (
        [username, email, fullname, age, role, gender, organizationId].some(
            field => typeof field !== 'string' || field.trim() === ""
        )
    ) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide all the required fields"));
    }

    const existingUser = await User.findOne({
        $or: [
            { username },
            { email },
        ]
    });
    console.log("existingUser:", existingUser)

    if (existingUser) {
        return res.status(409).json(new ApiError(409, "An user with the same username, or email already exists"));
    }
    logger.warn("avatar path", req.files)

    const localAvatarPath = req.files && 'avatar' in req.files ? req.files.avatar[0].path : "";
    const localCoverImagePath = req.files && 'coverImage' in req.files ? req.files.coverImage[0].path : "";

    if (!localAvatarPath || !fs.existsSync(localAvatarPath)) {
        return res.status(400).json(new ApiError(400, "Please upload a valid avatar"));
    }

    let avatarCludinaryUrl;
    try {
        avatarCludinaryUrl = await uploadOncloudinary(localAvatarPath);
        logger.info("Avatar uploaded:", avatarCludinaryUrl);
    } catch (error) {
        logger.error("Error uploading avatar:", error);
        return res.status(400).json(new ApiError(400, "Something went wrong while uploading avatar"));
    }

    let coverImageCludinaryUrl;
    if (localCoverImagePath && fs.existsSync(localCoverImagePath)) {
        try {
            coverImageCludinaryUrl = await uploadOncloudinary(localCoverImagePath);
            logger.info("Cover image uploaded:", coverImageCludinaryUrl);
        } catch (error) {
            logger.error("Error uploading cover image:", error);
            return res.status(400).json(new ApiError(400, "Something went wrong while uploading cover image"));
        }
    } else {
        logger.warn("No cover image provided or file not found");
        coverImageCludinaryUrl = { url: "" }; // Default value if no cover image is uploaded
    }

    const user = await User.create({
        username,
        email,
        password,
        fullname,
        avatar: avatarCludinaryUrl?.url,
        coverImage: coverImageCludinaryUrl?.url || "",
        age,
        role,
        gender,
        organizationId,
        phone,
        address,
        status,
        dateOfBirth,
        biography,
        permissions,
        socialLinks,
        preferences,
    });

    const createdUser = await User.findById(user._id).populate({
        path: 'user',
        strictPopulate: false
    });

    if (!createdUser) {
        return res.status(500).json(new ApiError(404, "Sonthing went wrong while registering user"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User is registered successfully"));

})


export {
    getAllUsers,
    createUser,
    getUserById,
    updateUserById,
    deleteUserById,
    deleteBulkUsers,
    createBulkUsers,
    loginUser,
    registerUser
}