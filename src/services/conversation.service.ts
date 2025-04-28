// @ts-nocheck
import { Conversation } from "@models/conversation.models";
import GenericService from "./generic.service";
import { User } from "@models/user.models";
import { ApiError } from "@utils/ApiError";


class ConversationService {
    private courseService: GenericService<any, any>;

    constructor() {
        this.courseService = new GenericService<any, any>(Conversation);
    }

    async getUserConversations(user_id) {
        let conversations;
        await Conversation.find({
            users: { $elemMatch: { $eq: user_id } },
        })
            .populate("users", "-refreshToken -password -permissions -friends -biography -dateOfBirth -gender -verified -email -avatar -refreshToken -address -socialLinks -preferences -phone")
            .populate("admin", "-verified -password -passwordChangedAt -friends")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "firstName lastName avatar email activityStatus onlineStatus",
                });
                conversations = results;
            })
            .catch((err) => {
                throw new ApiError(400, null, 'Error fetching conversations, try again', undefined, [{ msg: 'Error fetching conversations, try again' }]);
            });

        return conversations;
    }

    async findConversation(sender_id, receiver_id) {
        let convos;
        if (sender_id.toString() === receiver_id.toString()) {
            convos = await Conversation.find({
                isGroup: false,
                users: { $all: [receiver_id], $size: 1 },
            })
                .populate("users", "-refreshToken -password -permissions -friends -biography -dateOfBirth -gender -verified -email -avatar -refreshToken -address -socialLinks -preferences -phone")
                .populate("latestMessage");
        } else {
            convos = await Conversation.find({
                isGroup: false,
                $and: [
                    { users: { $elemMatch: { $eq: sender_id } } },
                    { users: { $elemMatch: { $eq: receiver_id } } },
                ],
            })
                .populate("users", "-refreshToken -password -permissions -friends -biography -dateOfBirth -gender -verified -email -avatar -refreshToken -address -socialLinks -preferences -phone")
                .populate("latestMessage");
        }

        // conversation doesnt exists
        if (!convos) {
            throw new ApiError(400, null, 'Something went wrong in getting conversation', undefined, [{ msg: 'Something went wrong in getting conversation' }]);
        }

        // populating messages model
        convos = await User.populate(convos, {
            path: "latestMessage.sender",
            select: "firstName lastName email avatar activityStatus",
            
        });

        return convos[0];
    }

    async createConversation(convoData) {
        const newConvo = await Conversation.create(convoData);

        if (!newConvo) {
            throw new ApiError(400, null, 'Unable to create conversation', undefined, [{ msg: 'Unable to create conversation' }]);
        }

        const populatedConvo = await Conversation.findOne({
            _id: newConvo._id,
        }).populate("users", "-refreshToken -password -permissions -friends -biography -dateOfBirth -gender -verified -email -avatar -refreshToken");

        if (!populatedConvo) {
            throw new ApiError(400, null, 'Unable to populate conversation', undefined, [{ msg: 'Unable to populate conversation' }]);
        }

        return populatedConvo;
    }

}


export const conversationService = new ConversationService();