// @ts-nocheck
import { NextFunction, Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { FriendRequest } from "../models/friendRequest.models";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.models";
import { friendRequestService } from "../services/friendRequest.setvice";

const acceptRejectRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const receiver_id = req.user.id;
    const { sender_id, action_type } = req.body;

    // check for required fields
    if (!sender_id || !action_type) {
        return res
            .status(400)
            .json(new ApiError(400, "Required Fields: sender_id, action_type"));
    }

    // check if sender is same as receiver
    if (receiver_id.toString() === sender_id.toString()) {
        return res
            .status(400)
            .json(new ApiError(400, "Required Fields: sender_id, action_type"));
    }

    // find the friend request
    const friendRequest = await FriendRequest.findOne({
        sender: sender_id,
        recipient: receiver_id,
    });

    // check if the friend request exists
    if (!friendRequest) {
        // throw createHttpError.NotFound("Friend request not found");
        return res
            .status(400)
            .json(new ApiError(400, "Friend request not found"));
    }

    // remove the friend request
    await friendRequest.deleteOne();

    if (action_type.toLowerCase() === "reject") {
        return res
            .status(200)
            .json(new ApiResponse(200, receiver_id, "Friend request rejected"));
    } else {
        // update friends list for both sender and receiver
        await User.findByIdAndUpdate(sender_id, {
            $push: { friends: receiver_id },
        });
        await User.findByIdAndUpdate(receiver_id, {
            $push: { friends: sender_id },
        });
        return res
            .status(200)
            .json(new ApiResponse(200, receiver_id, "Friend request accepted"));
    }
})

const cancelRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sender_id = req.user.id;
    const { receiver_id } = req.body;

    // check for required fields
    if (!receiver_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Required field: receiver_id"));
    }

    // check if sender is same as receiver
    if (sender_id.toString() === receiver_id.toString()) {
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong"));
    }

    // find the friend request
    const friendRequest = await FriendRequest.findOne({
        $or: [
            { sender: sender_id, recipient: receiver_id },
            { sender: receiver_id, recipient: sender_id },
        ],
    });

    // check if the friend request exists
    if (!friendRequest) {
        return res
            .status(400)
            .json(new ApiError(400, "Friend request not found"));
    }

    // remove the friend request
    await friendRequest.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, receiver_id, "Friend request canceled"));

})

const getFriends = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user.id;

    // find the user and populate the friends list
    const user = await User.findById(user_id).populate(
        "friends",
        "_id fullname avatar activityStatus onlineStatus email"
    );

    // return list of friends for current user
    return res
        .status(200)
        .json(new ApiResponse(200, { friends: user.friends }, "Friend request canceled"));
})

const getOnlineFriends = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user._id;
    // console.log(" user_id:", user_id)

    // find the user and populate the friends list
    const user = await User.findById(user_id).populate(
        "friends",
        // "_id firstName lastName avatar onlineStatus"
    );
    // console.log(" user:", user)

    // filter online friends
    const onlineFriends = user.friends.filter(
        (friend) => friend.onlineStatus === "online"
    );

    // return list of friends for current user
    return res
        .status(200)
        .json(new ApiResponse(200, { onlineFriends: onlineFriends }, "Friend request canceled"));
})

const getRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user.id;

    // find friend requests where the current user is the recipient
    const friendRequests = await FriendRequest.find({
        recipient: user_id,
    }).populate("sender", "_id firstName lastName avatar activityStatus email");

    return res
        .status(200)
        .json(new ApiResponse(200, { friendRequests }, "Friend removed successfully"));
})

const getSentRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user.id;

    // Aggregate pipeline to fetch sent requests and add requestSent field
    const sentRequests = await FriendRequest.aggregate([
        {
            $match: { sender: user_id },
        },
        {
            $lookup: {
                from: "users",
                localField: "recipient",
                foreignField: "_id",
                as: "recipient",
            },
        },
        { $unwind: "$recipient" },
        {
            // Add extra fields
            $addFields: {
                "recipient.isSent": true,
                "recipient.receiver_id": "$recipient._id",
            },
        },
        {
            // Project only recipient object
            $project: {
                _id: "$recipient._id",
                firstName: "$recipient.firstName",
                lastName: "$recipient.lastName",
                avatar: "$recipient.avatar",
                activityStatus: "$recipient.activityStatus",
                email: "$recipient.email",
                isSent: "$recipient.isSent",
                receiverId: "$recipient.receiver_id",
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, { sentRequests }, "Friend removed successfully"));
})

const removeFriend = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { friend_id } = req.body;
    // console.log(req.body)
    // console.log(user.id)
    // console.log(friend_id)

    // check if user_id is same as friend_id
    if (user.id.toString() === friend_id.toString()) {
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong"));
    }

    // check for required fields
    if (!friend_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Required Field: friend_id"));
    }

    // check if the friend exists in the user's friends list
    if (!user.friends.includes(friend_id)) {
        return res
            .status(400)
            .json(new ApiError(400, "Friend not found in your friends list"));
    }

    // remove the friend from the user's friends list
    await User.findByIdAndUpdate(user._id, {
        $pull: { friends: friend_id },
    });

    // remove the user from the friend's friends list
    await User.findByIdAndUpdate(friend_id, {
        $pull: { friends: user._id },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { friend_id: friend_id }, "Friend removed successfully"));
})

const searchFriends = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const current_user = req.user;

    const keyword = req.query.search;
    const page = req.query.page || "0";

    // check for required fields
    if (!keyword) {
        return res
            .status(400)
            .json(new ApiError(400, "Query required"));
    }

    // Populate friends data for the current user
    const users = await User.findById(current_user._id)
        .select("friends")
        .populate({
            path: "friends",
            select: "firstName lastName _id email verified",
        });

    const { friends, totalCount } = await friendRequestService.searchForFriends(
        users,
        keyword,
        page
    );

    // return list of friends for current user
    return res
        .status(200)
        .json(new ApiResponse(200, {
            usersFound: totalCount,
            friends: friends,
        }, "Organization is created successfully"));

})

const sendRequest = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sender = req.user;
    const { receiver_id } = req.body;

    // check for required fields
    if (!receiver_id) {
        return res
            .status(400)
            .json(new ApiError(400, "Required field: receiver_id"));
    }

    // check if verified receiver exists
    const receiver = await User.findOne({
        _id: receiver_id,
        // verified: true,
    }).select("-password -passwordChangedAt");

    if (!receiver) {
        return res
            .status(400)
            .json(new ApiError(400, "User does not exisit"));
    }

    // check if sender is same as receiver
    if (sender.id.toString() === receiver._id.toString()) {
        return res
            .status(400)
            .json(new ApiError(400, "Something went wrong"));
    }

    // check if they are already friends
    if (receiver.friends.includes(sender.id) || sender.friends.includes(receiver._id)) {
        return res
            .status(400)
            .json(new ApiError(400, "You are already friends"));
    }

    // check if there is an existing friend request
    const existingRequest = await FriendRequest.findOne({
        sender: sender.id,
        recipient: receiver._id,
    });

    if (existingRequest) {
        return res
            .status(400)
            .json(new ApiError(400, "Friend request already sent"));
    }

    // create a new friend request
    const newFriendRequest = new FriendRequest({
        sender: sender.id,
        recipient: receiver._id,
    });

    await newFriendRequest.save();
    let response = {
        sender: {
            _id: sender.id,
            firstName: sender.firstName,
            lastName: sender.lastName,
        },
        receiver: {
            _id: receiver._id,
            firstName: receiver.firstName,
            lastName: receiver.lastName,
        },
    }

    return res
        .status(200)
        .json(new ApiResponse(200, response, "Friend Request sent successfully"));
})

const getOrgUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const organizationId = req.user?.organizationId;
    const currentUser_id = req.user?.id;
    const friends_ids = req.user?.friends.map(friend => friend._id.toString());

    if (!organizationId) {
        return res
            .status(400)
            .json(new ApiError(400, "Organization ID is not provided"));
    }
    const matchCondition = { organizationId: organizationId };

    const userAggregate = User.aggregate([
        { $match: matchCondition },
        {
            $addFields: {
                requestSent: {
                    $cond: {
                        if: {
                            $in: ["$_id", friends_ids],
                        },
                        then: false, // If user is already a friend, requestSent is false
                        else: {
                            $in: [
                                "$_id",
                                await FriendRequest.find({
                                    sender: currentUser_id,
                                }).distinct("recipient"),
                            ],
                        },
                    },
                },

            },
        },
        {
            $project: {
                _id: 1,
                fullname: 1,
                requestSent: 1,
                email: 1,
                activityStatus: 1,
                verified: 1,
                onlineStatus: 1,
                role: 1,
                status: 1,
                gender: 1,
                avatar: 1
            },
        },
    ]);

    const users = await userAggregate.exec();

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users from the organization are fetched successfully"));
})

// ----------------------- Socket: Friend Status -----------------------
const emitFriendStatus = async (io, socket, user, onlineStatus) => {
    try {
        user.friends.forEach((friend) => {
            const friend_id = friend._id.toString();
            io.to(friend_id).emit("online_friends", {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                onlineStatus: onlineStatus,
            });
        });
    } catch (error) {
        socket.errorHandler("Online friends error");
    }
};

export {
    acceptRejectRequest,
    cancelRequest,
    getFriends,
    getOnlineFriends,
    getRequests,
    getSentRequests,
    removeFriend,
    searchFriends,
    sendRequest,
    getOrgUsers,
    emitFriendStatus
}