import { User } from "@models/user.models";
import { conversationService } from "@services/conversation.service";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";
import { NextFunction, Response } from "express";

const createOpenConversation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id: sender_id } = req.user;
    const { receiver_id } = req.body;

    if (!receiver_id) {
        throw new ApiError(400, null, 'Something went wrong', undefined, [{ msg: 'Something went wrong' }]);

    }

    // check if receiver exists
    const receiver = await User.findOne({
        _id: receiver_id,
        // verified: true,
    });
    // console.log(receiver)
    // check if receiver exists
    if (!receiver) {
        throw new ApiError(400, null, 'Verified Receiver does not exist', undefined, [{ msg: 'Verified Receiver does not exist' }]);
    }

    // check for existing conversation
    const existing_conversation = await conversationService.findConversation(
        sender_id,
        receiver_id
    );
    const isValidFriendShip = !(
        !req.user.friends.includes(receiver_id) ||
        !req.user.friends.includes(sender_id)
    );

    if (existing_conversation) {
        res.status(200).json({
            status: "success",
            conversation: existing_conversation,
            isValidFriendShip,
        });
    } else {
        // check if users are friends
        if (
            !req.user.friends.includes(receiver_id) ||
            !receiver.friends.includes(sender_id)
        ) {
            throw new ApiError(400, null, 'You are not friends with this user', undefined, [{ msg: 'You are not friends with this user' }]);
        }

        // creating a new conversation
        let convoData;

        if (sender_id.toString() === receiver_id.toString()) {
            convoData = {
                name: `${receiver.fullname}`,
                isGroup: false,
                users: [receiver_id],
            };
        } else {
            convoData = {
                name: `${receiver.fullname}`,
                isGroup: false,
                users: [sender_id, receiver_id],
            };
        }

        const new_conversation = await conversationService.createConversation(convoData);

        res.status(200).json({
            status: "success",
            conversation: new_conversation,
            isValidFriendShip,
        });
    }

})

const getConversations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: user_id } = req.user

        const conversations = await conversationService.getUserConversations(user_id);
        console.log("conversations", conversations)
        res.status(200).json(new ApiResponse(200, conversations, "Course is created successfully"));
    } catch (error) {
        next(error);
    }
})

// ----------------------- Socket: Join Convo -----------------------
export const joinConvo = async (socket, user_id) => {
    try {
        const conversations = await conversationService.getUserConversations(user_id);

        conversations.map((convo) => {
            socket.join(convo._id.toString());
        });
    } catch (error) {
        socket.errorHandler("Join convo error");
    }
};

export {
    createOpenConversation,
    getConversations
}