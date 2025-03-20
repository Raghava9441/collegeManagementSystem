import mongoose, { Schema, Document } from "mongoose";
import mongooseAggregatePaginate, { } from 'mongoose-aggregate-paginate-v2';

interface IChat extends Document {
    participants: { userId: mongoose.Types.ObjectId; role: string }[];
    lastMessage?: string;
    lastMessageAt?: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        participants: [
            {
                userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
                role: { type: String, enum: ["TEACHER", "STUDENT", "PARENT"], required: true },
            },
        ],
        lastMessage: { type: String },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ChatSchema.plugin(mongooseAggregatePaginate)
export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
