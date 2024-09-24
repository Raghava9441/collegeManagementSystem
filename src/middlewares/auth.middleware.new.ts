import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/user.models';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; // Assuming you're using this

interface AuthRequest extends Request {
    user?: any;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken; // Using cookieParser middleware

        if (!accessToken) {
            return res.status(401).json(new ApiError(401, "Access token is required"));
        }

        try {
            // Verify the JWT token and ensure the payload contains _id or other identifier
            const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload & { _id: string };

            // Retrieve user from the database
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
            if (!user) {
                return res.status(401).json(new ApiError(401, "Invalid access token"));
            }

            req.user = user;  // Store user info in req for use in next middlewares
            next();
        } catch (error) {
            // Token verification failed (e.g., invalid token, token expired)
            console.error("Token verification error:", error);
            return res.status(401).json(new ApiError(401, "Invalid or expired access token"));
        }
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json(new ApiError(500, 'An error occurred during authentication.'));
    }
};

const authorize = (roles: string[] | string = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        auth,  // Ensure the user is authenticated first
        (req: AuthRequest, res: Response, next: NextFunction) => {
            if (roles.length && !roles.includes(req.user?.role)) {
                return res.status(403).json(new ApiError(403, 'Forbidden - Insufficient permissions'));
            }
            next();
        }
    ];
};

export { auth, authorize };
