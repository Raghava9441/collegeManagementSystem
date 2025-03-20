
import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderRole: string;
    message: string;
    isRead: boolean;
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        senderRole: { type: String, enum: ["TEACHER", "STUDENT", "PARENT"], required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
