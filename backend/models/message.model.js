import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    sharedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    }
}, { timpestamps: true });
export const Message = mongoose.model('Message', messageSchema);