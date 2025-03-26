import mongoose, { Schema } from "mongoose";

export interface IFriendRequest {

}

const requestSchema = new Schema({
    sender: {
        // reffering to the users id
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
})

export const FriendRequest = mongoose.model('FriendRequest', requestSchema);
