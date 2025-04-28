
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Message } from "../models/message.models";
import { ApiResponse } from "../utils/ApiResponse";

// const createChat = asyncHandler(async (req: Request, res: Response) => {

//     if (!req?.user) {
//         throw new ApiError(404, null, "User not authenticated", undefined, [{ msg: "User not authenticated" }]);
//     }

//     const { id: userId, role } = req.user;
//     const { participantId, participantRole } = req.body;
//     //move all request validations to validate function and validate it in route level only not in controllers
//     if (!participantId || !participantRole) {
//         throw new ApiError(404, null, "User not authenticated", undefined, [{ msg: "User not authenticated" }]);
//     }

//     let chat = await Chat.findOne({
//         participants: { $all: [{ userId }, { userId: participantId }] },
//     });

//     if (!chat) {
//         chat = await Chat.create({
//             participants: [
//                 { userId, role },
//                 { userId: participantId, role: participantRole },
//             ],
//         });
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, chat, "Chat is created successfully"));

// })

// const getUserChats = asyncHandler(async (req: Request, res: Response) => {

//     if (!req?.user) {
//         throw new ApiError(404, null, "User not authenticated", undefined, [{ msg: "User not authenticated" }]);
//     }

//     const chats = await Chat.find({ "participants.userId": req.user.id }).populate("participants.userId", "username role");

//     return res
//         .status(200)
//         .json(new ApiResponse(200, chats, "user chat fetched successfully"));
// })

// const sendMessage = asyncHandler(async (req: Request, res: Response) => {

//     if (!req?.user) {
//         throw new ApiError(404, null, "User not authenticated", undefined, [{ msg: "User not authenticated" }]);
//     }
//     const { chatId, message } = req.body;
//     const { id: userId, role } = req.user;

//     if (!chatId || !message) {
//         throw new ApiError(404, null, "Chat ID and message are required", undefined, [{ msg: "Chat ID and message are required" }]);
//     }

//     const msg = await Message.create({ chatId, senderId: userId, senderRole: role, message });
//     await Chat.findByIdAndUpdate(chatId, { lastMessage: message, lastMessageAt: new Date() });

//     return res
//         .status(200)
//         .json(new ApiResponse(200, msg, "msg send successfull"));
// })

const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    return res
        .status(200)
        .json(new ApiResponse(200, messages, "msg feteched successfull"));
})

export {
    // createChat,
    // getUserChats,
    // sendMessage,
    getMessages
}