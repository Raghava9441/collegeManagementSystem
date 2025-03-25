
import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderRole: string;
    message: string;
    isRead: boolean;
    conversation: mongoose.Types.ObjectId;
    files: [],
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        senderRole: { type: String, enum: ["TEACHER", "STUDENT", "PARENT"], required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        conversation: { type: mongoose.Schema.ObjectId, ref: "Conversation" },
        files: [],
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
