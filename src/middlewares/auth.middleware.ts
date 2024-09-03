import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from 'jsonwebtoken';


export const verifyJWT = async (req: any, res: any, next: any) => {
    const accessToken = req.cookies.accessToken || req.headers("Authorization")?.replace("Bearer", "");
    if (!accessToken) {
        return res.status(401).json(new ApiError(401, "Please login to access this resource"));
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload & { _id: string };
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
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