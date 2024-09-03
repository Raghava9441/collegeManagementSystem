import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { IUser, User } from "../models/user.models";
import { asyncHandler } from "../utils/asyncHandler";
import * as XLSX from 'xlsx';
import { getMongoosePaginationOptions } from "../utils/healpers";
import logger from "../utils/logger";
import { deleteFromCloudinary, uploadOncloudinary } from "../utils/cloudinary";
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json(new ApiError(400, "Please provide all the required fields"));
    }

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
    const tokens = await generateAccessAndRefreshToken(user._id as string);

    if (!tokens) {
        return res.status(500).json(new ApiError(500, "Something went wrong while generating tokens"));
    }

    const { accessToken, refreshToken } = tokens;

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if (!loggedInUser) {
        return res.status(500).json(new ApiError(500, "Something went wrong while logging in user"));
    }
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }
    // Return success response with user data and tokens
    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User is logged in successfully"));
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
    }

    try {
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
    } catch (error) {
        logger.error("Error registering user:", error);
        if (avatarCludinaryUrl) {
            await deleteFromCloudinary(avatarCludinaryUrl.public_id);
        }
        if (coverImageCludinaryUrl) {
            await deleteFromCloudinary(coverImageCludinaryUrl.public_id);
        }
        throw new ApiError(404, "Sonthing went wrong while registering user and deleting imagess");
    }

})


const generateAccessAndRefreshToken = async (userId: string): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
        const user: IUser | null = await User.findById(userId);

        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return null;
        }

        const accessToken = user.genetateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        // Optionally, you can save the refreshToken to the database if needed
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error generating tokens:', error);
        throw new ApiError(500, "somthing went wrong while generatting access and refesh tokens")
        // or handle it in a way that's appropriate for your application
    }
};

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const imcomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!imcomingRefreshToken) {
        return res.status(400).json(new ApiError(400, "Please provide a refresh token"));
    }

    try {
        const decodedToken = jwt.verify(imcomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload & { _id: string };
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            return res.status(404).json(new ApiError(404, "invalid refresh token"));
        }

        if (user?.refreshToken !== imcomingRefreshToken) {
            return res.status(401).json(new ApiError(401, "invalid refresh token"));
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        }

        const { accessToken, refreshToken: newRefreshToken } = await user.generateAccessRefreshTokens(user._id as string);

        return res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newRefreshToken }, "User is logged in successfully"));

    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token");
    }
})
interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
const logoutUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    
    if (!req.user) {
        return res.status(401).json(new ApiError(401, "Unauthorized"));
    }
    await User.findByIdAndUpdate(
        //need to come back here after middlewaare is done
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }
    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, "User is logged out successfully", "User is logged out successfully"));
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
    registerUser,
    refreshAccessToken,
    logoutUser
}