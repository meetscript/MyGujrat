import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: { type: String, default: '' ,minlength: 100, maxlength: 2000},
    image: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    public_id: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        name: { type: String }
    }
}, { timestamps: true }); // Fixed: should be in options object, not as a field

export const Post = mongoose.model('Post', postSchema);