import { Conversation } from "@models/conversation.models";
import { messageService } from "@services/message.service";
import { ApiError } from "@utils/ApiError";
import { ApiResponse } from "@utils/ApiResponse";
import { asyncHandler } from "@utils/asyncHandler";

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user

    const { message, convo_id, files } = req.body;

    if (!convo_id || (!message && !files)) {
        throw new ApiError(400, null, 'Invalid conversation id or message', undefined, [{ msg: 'Invalid conversation id or message' }]);
    }

    const convo_exists = await Conversation.findById({ _id: convo_id });

    if (!convo_exists) {
        throw new ApiError(400, null, 'Conversation does not exist', undefined, [{ msg: 'Conversation does not exist' }]);
    }

    // Check if there's only one user in the conversation and it's the current user
    if (!(convo_exists.users.length === 1 && convo_exists.users[0].toString() === id.toString())) {
        // Check if users are friends
        await messageService.validateFriendship(id, convo_exists);
    }
    const msgData = {
        sender: id,
        message,
        conversation: convo_id,
        files: files || [],
    };
    const newMessage = await messageService.createMessage(msgData);
    await messageService.updateLatestMessage(convo_id, newMessage);
    const populatedMessage = await messageService.populateMessage(newMessage._id);

    return res
        .status(200)
        .json(new ApiResponse(200, populatedMessage, "Messages are fetched successfully"));

})

const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const convo_id = req.params.convo_id;

    if (!convo_id) {
        throw new ApiError(400, null, 'Conversation id is required', undefined, [{ msg: 'Conversation id is required' }]);
    }

    const messages = await messageService.getConvoMessages(convo_id);
    // console.log(messages)

    return res
        .status(200)
        .json(new ApiResponse(200, messages, "Messages are fetched successfully"));
})

// -------------------------- Socket Send Message --------------------------
const socketSendMessage = async (socket, user_id, messageData) => {
    try {
        const { _id, message, conversation, files } = messageData;
        const convo_id = conversation._id;
        if (!convo_id || (!message && !files)) {
            throw new ApiError(400, null, 'Invalid conversation id or message', undefined, [{ msg: 'Invalid conversation id or message' }]);

        }

        const convo_exists = await Conversation.findById({ _id: convo_id });

        if (!convo_exists) {
            throw new ApiError(400, null, 'Conversation does not exist', undefined, [{ msg: 'Conversation does not exist' }]);
        }

        // Check if there's only one user in the conversation and it's the current user
        if (!(convo_exists.users.length === 1 && convo_exists.users[0].toString() === id.toString())) {
            // Check if users are friends
            await messageService.validateFriendship(_id, convo_exists);
        }
        const msgData = {
            sender: user_id,
            message,
            conversation: convo_id,
            files: files || [],
        };
        console.log("msgData", msgData)
        const newMessage = await messageService.createMessage(msgData);
        await messageService.updateLatestMessage(convo_id, newMessage);
        const populatedMessage = await messageService.populateMessage(newMessage._id);

        return { message: populatedMessage };
    } catch (error) {
        console.log(error)
    }
}


export {
    sendMessage,
    getMessages,
    socketSendMessage
}