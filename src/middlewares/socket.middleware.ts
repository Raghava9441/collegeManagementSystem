
import { User } from '@models/user.models';
import { ApiError } from '@utils/ApiError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';



export const socketMiddleware = async (socket, next) => {

    const token = socket.handshake.query.token as string;
    console.log(token)
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload & { _id: string };

            console.log(" decodedToken:", decodedToken.id)
            // Check for token expiration
            // const currentTime = Math.floor(Date.now() / 1000);

            // if (decodedToken.exp && decodedToken.exp < currentTime) {
            //     return next(new ApiError(401, null, "Invalid access token", undefined, [{ msg: "Invalid access token" }]));
            // }

            // check for existing user with the same token
            const this_user = await User.findOne({
                _id: decodedToken.id,
            });

            if (!this_user) {
                return next(new ApiError(401, null, "Unidentified User, Please login again", undefined, [{ msg: "Unidentified User, Please login again" }]));
            }
            socket.user = this_user;
            console.log('Middleware completed successfully');
            next();
        } catch (error) {
            return next(new ApiError(401, null, "Invalid token, Please login again", undefined, [{ msg: "Invalid token, Please login again" }]));

        }
    } else {
        return next(new ApiError(401, null, "Invalid token, Please login again", undefined, [{ msg: "Invalid token, Please login again" }]));

    }
    // console.log(Object.keys(socket.handshake))
}