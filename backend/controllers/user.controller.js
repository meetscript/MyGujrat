import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import generateToken  from "../utils/generateToken.js";
import streamifier from "streamifier";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1️⃣ Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Try a different one!",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // 5️⃣ Save user to DB
    await newUser.save();

    // 6️⃣ Generate JWT token
    generateToken(newUser._id, res); // assuming this sets cookie or header

    // 7️⃣ Send success response
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    // 2️⃣ Find user and populate posts (with author info)
    const user = await User.findOne({ email })
      .populate({
        path: "posts",
        populate: { path: "author", select: "username profilePicture" }, // nested populate for author
      })
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password!",
      });
    }

    // 3️⃣ Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password!",
      });
    }

    // 4️⃣ Generate JWT token
    generateToken(user._id, res);

    // 5️⃣ Exclude password before sending user data
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts, // already populated!
    };

    // 6️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: userData,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getalluser = async (req, res) => {
  try {
    const userId = req.id; // assuming JWT middleware sets req.user

    // Optional: exclude already-followed users
    const currentUser = await User.findById(userId);

    const suggestedUsers = await User.find().select("-password");
    if (suggestedUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No other users found",
      });
    }

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });

  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        select: "author image caption explaination likes comments createdAt",
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: "author",
            select: "username profilePicture",
          },
          {
            path: "comments",
            populate: {
              path: "author",
              select: "username profilePicture",
            },
          },
        ],
      })
      .populate({
        path: "bookmarks",
        select: "image caption explaination",
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      })
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "query required" });

    const users = await User.find({
      username: { $regex: `^${q}`, $options: "i" },
    }).select("username profilePicture _id");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const file = req.file;

    // 🧠 1. Find the user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let newImageUrl = user.profilePicture;

    // 🧷 2. If a new image is uploaded
    if (file) {
      // 🗑️ Delete old image from Cloudinary (if exists)
      if (user.profilePicture) {
        try {
          // Extract public_id from the old Cloudinary URL
          const publicId = user.profilePicture
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0]; // e.g. instagram/profile_pictures/abc123

          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.warn("Old image deletion failed:", deleteError.message);
        }
      }

      // ☁️ Upload new image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "instagram/profile_pictures" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      newImageUrl = uploadResult.secure_url;
    }

    // 📝 3. Update profile fields
    if (bio) user.bio = bio.trim();
    if (gender) user.gender = gender;
    user.profilePicture = newImageUrl;

    // 💾 4. Save updated user
    await user.save();

    // ✅ 5. Respond with success
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.id; // assuming JWT middleware sets req.user

    // Optional: exclude already-followed users
    const currentUser = await User.findById(userId);

    const suggestedUsers = await User.find({
      _id: { $ne: userId, $nin: currentUser?.following || [] }
    }).select("-password");

    if (suggestedUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No other users found",
      });
    }

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });

  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followerId = req.id; // The user who is performing the action
    const targetUserId = req.params.id; // The user being followed/unfollowed

    // 🧩 Prevent self-follow
    if (followerId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow or unfollow yourself",
      });
    }

    // 🧩 Fetch both users (only necessary fields)
    const [follower, targetUser] = await Promise.all([
      User.findById(followerId),
      User.findById(targetUserId),
    ]);

    if (!follower || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isAlreadyFollowing = follower.following.includes(targetUserId);

    if (isAlreadyFollowing) {
      // 🔹 Unfollow logic
      await Promise.all([
        User.updateOne({ _id: followerId }, { $pull: { following: targetUserId } }),
        User.updateOne({ _id: targetUserId }, { $pull: { followers: followerId } }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Unfollowed successfully",
        following: false,
      });
    } else {
      // 🔹 Follow logic
      await Promise.all([
        User.updateOne({ _id: followerId }, { $addToSet: { following: targetUserId } }), // prevents duplicates
        User.updateOne({ _id: targetUserId }, { $addToSet: { followers: followerId } }),
      ]);

      return res.status(200).json({
        success: true,
        message: "Followed successfully",
        following: true,
      });
    }
  } catch (error) {
    console.error("Error in followOrUnfollow:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
