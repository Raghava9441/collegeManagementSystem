import { Conversation } from "../models/conversation.models";
import { IMessage, Message } from "../models/message.models";
import { User } from "../models/user.models";
import { ApiError } from "../utils/ApiError";
import GenericService from "./generic.service";



class MessageService {
    private userService: GenericService<IMessage, any>;

    constructor() {
        this.userService = new GenericService<IMessage, any>(Message); // Pass User model
    }

    async validateFriendship(sender_id: string, conversation) {
        // extract receiver id from convo
        const users = conversation.users;
        const receiver_id = users.find(
            (user) => user.toString() !== sender_id.toString()
        );

        // getting sender and receiver
        const senderUser = await User.findById(sender_id);
        const receiverUser = await User.findById(receiver_id);

        // Check if users are friends
        // TODO:need to fix this 
        // if (
        //     !senderUser?.friends?.includes(receiver_id) ||
        //     !receiverUser.friends.includes(sender_id)
        // ) {
        //     throw new ApiError(400, null, 'You are no longer friends with this user', undefined, [{ msg: 'You are no longer friends with this user' }]);
        // }
    };
    async createMessage(data) {
        const newMessage = await Message.create(data);

        if (!newMessage) {
            throw new ApiError(400, null, 'Unable to create new message', undefined, [{ msg: 'Unable to create new message' }]);

        }

        return newMessage;
    };


    async updateLatestMessage(convo_id, msg) {
        const updatedConvo = await Conversation.findByIdAndUpdate(convo_id, {
            latestMessage: msg,
        });

        if (!updatedConvo) {
            throw new ApiError(400, null, 'Unable to update latest message', undefined, [{ msg: 'Unable to update latest message' }]);
        }

        return updatedConvo;
    };

    async populateMessage(id) {
        const msg = await Message.findById(id)
            .populate({
                path: "sender",
                select: "firstName lastName avatar",
                model: "User",
            })
            .populate({
                path: "conversation",
                select: "name picture isGroup users latestMessage",
                model: "Conversation",
                populate: [
                    {
                        path: "users",
                        select: "firstName lastName avatar email activityStatus onlineStatus",
                        model: "User",
                    },
                    {
                        path: "latestMessage",
                        model: "Message",
                        populate: {
                            path: "sender",
                            select:
                                "firstName lastName avatar email activityStatus onlineStatus",
                            model: "User",
                        },
                    },
                ],
            });

        if (!msg) {
            throw new ApiError(400, null, 'Unable to populate message', undefined, [{ msg: 'Unable to populate message' }]);
        }

        return msg;
    };

    async getConvoMessages(convo_id) {
        
        const messages = await Message.find({ conversation: convo_id })
            .populate({
                path: "sender",
                select: "avatar email activityStatus",
                model: "User",
            })
            .populate("conversation");
            console.log(messages)

        if (!messages) {
            throw new ApiError(400, null, 'Unable to fetch messages', undefined, [{ msg: 'Unable to fetch messages' }]);

        }

        return messages;
    };

}

export const messageService = new MessageService();

