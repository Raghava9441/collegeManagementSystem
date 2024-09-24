import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction } from "express";


export const verifyJWT = async (req: any, res: any, next: any) => {
    // const accessToken = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer", "");
    const cookieHeader = req.headers.cookie;  // Get the cookie header
    let accessToken;

    if (cookieHeader) {
        // Extract accessToken from cookie string
        const cookies = cookieHeader.split(';').map((cookie: string) => cookie.trim());
        const accessTokenCookie = cookies.find((cookie: string) => cookie.startsWith('accessToken='));

        if (accessTokenCookie) {
            accessToken = accessTokenCookie.split('=')[1]
        }
    }
    if (!accessToken) {
        return res.status(401).json(new ApiError(401, "Please login to access this resource"));
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload & { _id: string };
        console.log("decodedToken:", decodedToken)
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");
        console.log("user:", user)
        if (!user) {
            return res.status(401).json(new ApiError(401, "Invalid access token"));
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json(new ApiError(401, "Invalid access token"));

    }
}

export const verifyPermission = (roles: string[] = []) =>
    asyncHandler(async (req: any, res: any, next: any) => {
        if (!req.user?._id) {
            throw new ApiError(401, "Unauthorized request");
        }
        if (roles.includes(req.user?.role)) {
            next();
        } else {
            throw new ApiError(403, "You are not allowed to perform this action");
        }
    });

export const isAdmin = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Admins only."));
    }
};

export const isTeacher = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'TEACHER' || req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Teachers only."));
    }
};

export const isStudent = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'STUDENT' || req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Students only."));
    }
};

export const isParent = async (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'PARENT' || req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json(new ApiError(403, "Access denied. Students only."));
    }
};
