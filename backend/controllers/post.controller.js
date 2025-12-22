import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import City from "../models/city.model.js";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "posts",
                resource_type: "image",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

export const addNewPost = async (req, res) => {
    try {
        const { caption, location } = req.body;
        const images = req.files;
        const authorId = req.id;

        if (!images || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required",
            });
        }
        if (caption && (caption.length < 100 || caption.length > 2000)) {
            return res.status(400).json({
                success: false,
                message: "Caption must be between 100 and 2000 characters",
            });
        }

        const imageUrls = [];
        const publicIds = [];

        // 🔥 upload images
        for (const image of images) {
            const optimizedBuffer = await sharp(image.buffer)
                .resize({ width: 800, height: 800, fit: "inside" })
                .jpeg({ quality: 80 })
                .toBuffer();

            const cloudResponse = await uploadToCloudinary(optimizedBuffer);

            imageUrls.push(cloudResponse.secure_url);
            publicIds.push(cloudResponse.public_id);
        }

        // Parse location (FormData safe)
        let locationData = null;
        if (location) {
            locationData =
                typeof location === "string" ? JSON.parse(location) : location;
        }

        const newPost = await Post.create({
            caption: caption?.trim() || "",
            images: imageUrls,
            public_ids: publicIds,
            author: authorId,
            location: locationData
                ? {
                    lat: locationData.lat,
                    lng: locationData.lng,
                    name: locationData.name,
                }
                : undefined,
        });

        await User.findByIdAndUpdate(authorId, {
            $push: { posts: newPost._id },
        });

        await newPost.populate({
            path: "author",
            select: "-password -email",
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: newPost,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const addcityPost = async (req, res) => {
    console.log("come");
    const { name, description, location } = req.body;
    const images = req.file;
    const userId = req.id;
    console.log("userId:", userId);
    try {
        if (!name || !images || images.length === 0) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }
        if (description.length < 500 || description.length > 10000) {
            return res.status(400).json({ message: 'Description must be between 500 and 10000 characters', success: false });
        }

        const urls = [];
        const publicIds = [];

        for (const image of images) {
            const optimizedImageBuffer = await sharp(image.buffer)
                .resize({ width: 800, height: 800, fit: "inside" })
                .jpeg({ quality: 80 })
                .toBuffer();
            const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
            console.log("come2");
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: "city",
                resource_type: "image",
            });
            urls.push(cloudResponse.secure_url);
            publicIds.push(cloudResponse.public_id);
        }

        let locationData = null;
        if (location) {
            locationData = typeof location === 'string' ? JSON.parse(location) : location;
        }
        console.log("come3");
        const newCityPost = await City.create({
            name,
            images: urls,
            description,
            location: locationData ? {
                lat: locationData.lat,
                lng: locationData.lng,
                name: locationData.name
            } : undefined,
            public_ids: publicIds,
            auther: userId
        });

        return res.status(201).json({
            message: 'City post created successfully',
            city: newCityPost,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error could not set post', success: false });
    }
}

export const getAllPost = async (req, res) => {
    console.log("get all post called");
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

export const getAllcities = async (req, res) => {
    console.log("get all cities called");
    try {
        const cities = await City.find().sort({ createdAt: -1 })
            .populate({ path: 'auther', select: 'username profilePicture' });
        return res.status(200).json({
            cities,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');

        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            // emit a notification event
            const notification = {
                type: 'like',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({ message: 'Post liked', success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            // emit a notification event
            const notification = {
                type: 'dislike',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }
        return res.status(200).json({ message: 'Post disliked', success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
}

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const { text } = req.body;

        const post = await Post.findById(postId);

        if (!text) return res.status(400).json({ message: 'text is required', success: false });

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId
        })

        await comment.populate({
            path: 'author',
            select: "username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: 'Comment Added',
            comment,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
};

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false });

        return res.status(200).json({ success: true, comments });

    } catch (error) {
        console.log(error);
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

        if (post.public_id) {
            await cloudinary.uploader.destroy(post.public_id);
        }

        await Post.findByIdAndDelete(postId);

        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

export const deletecitypost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await City.findById(postId);
        if (!post) return res.status(404).json({ message: 'CityPost not found', success: false });

        if (post.auther.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

        if (post.public_id) {
            await cloudinary.uploader.destroy(post.public_id);
        }

        await City.findByIdAndDelete(postId);
        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            // already bookmarked -> remove from the bookmark
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: 'Post removed from bookmark', success: true });

        } else {
            // bookmark krna pdega
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: 'Post bookmarked', success: true });
        }

    } catch (error) {
        console.log(error);
    }
};