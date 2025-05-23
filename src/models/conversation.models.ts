import mongoose, { Schema } from "mongoose";


export interface IConversation extends Document {
    name: string;
    picture: string;
    isGroup: boolean;
    users: [];
    latestMessage: mongoose.Types.ObjectId;
    admin: mongoose.Types.ObjectId;
}



const conversationSchema = new Schema<IConversation>(
    {
        name: { type: String, required: [true, "Name is required"], trim: true },

        picture: { type: String },

        isGroup: { type: Boolean, required: true, default: false },

        users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],

        latestMessage: { type: mongoose.Schema.ObjectId, ref: "Message" },

        admin: { type: mongoose.Schema.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
)

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
