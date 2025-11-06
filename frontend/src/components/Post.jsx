import React, { useState } from 'react'
import { Bookmark, MessageCircle, MoreHorizontal, Send, MapPin } from 'lucide-react'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import LocationMapDialog from './LocationMapDialog'
import { useDispatch, useSelector } from 'react-redux'
import toast from "react-hot-toast";
import { setPosts, setSelectedPost } from '../redux/postSlice'
import api from '../lib/axios'
import { cn } from '../lib/utils'

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const likeOrDislikeHandler = async () => {
    console.log("like/dislike clicked");
    try {
      const action = liked ? 'dislike' : 'like';
      console.log(`Sending ${action} request`);
      const res = await api.get(`/post/${post._id}/${action}`, { withCredentials: true });
      console.log(res.data);
      console.log("Request successful");
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map(p =>
          p._id === post._id ? {
            ...p,
            likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
          } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await api.post(`post/${post._id}/comment`, { text }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await api.delete(`post/delete/${post?._id}`, { withCredentials: true });
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await api.get(`post/${post?._id}/bookmark`, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLocationClick = () => {
    if (post.location && post.location.lat && post.location.lng) {
      setMapOpen(true);
    } else {
      toast.error("Location for this post is not available");
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="my-8 w-full max-w-sm mx-auto border border-base-300 rounded-xl shadow-sm p-3 bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-base-200">
            {post.author?.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-base-content">
                {post.author?.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-base-content">{post.author?.username}</h1>
            {user?._id === post.author._id && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-base-200 border border-base-300 text-base-content/70">
                Author
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <MoreHorizontal
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer hover:text-primary"
          />
          {menuOpen && (
            <div
              className={cn(
                "absolute right-0 mt-2 bg-base-100 border border-base-300 shadow-lg rounded-md w-40 text-sm flex flex-col z-10"
              )}
            >
              {post?.author?._id !== user?._id && (
                <button
                  className="px-4 py-2 text-error hover:bg-base-200 text-left"
                >
                  Unfollow
                </button>
              )}
              <button className="px-4 py-2 hover:bg-base-200 text-left text-base-content">
                Add to favorites
              </button>
              {user && user?._id === post?.author._id && (
                <button
                  onClick={deletePostHandler}
                  className="px-4 py-2 hover:bg-base-200 text-left text-base-content"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location Badge (if available) */}
      {post.location && post.location.name && (
        <div 
          onClick={handleLocationClick}
          className="flex items-center gap-1 mt-2 text-xs text-base-content/70 cursor-pointer hover:text-primary transition-colors"
        >
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[280px]">{post.location.name}</span>
        </div>
      )}

      {/* Image */}
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_img"
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={24}
              className="cursor-pointer text-error"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={22}
              className="cursor-pointer hover:text-primary"
            />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-primary"
          />
          <Send className="cursor-pointer hover:text-primary" />
        </div>

        <Bookmark
          onClick={bookmarkHandler}
          className="cursor-pointer hover:text-primary"
        />
      </div>

      {/* Likes */}
      <span className="font-medium block mb-2 text-base-content">{postLike} likes</span>

      {/* Caption */}
      <p className="text-base-content">
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>

      {/* Comments */}
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-base-content/60"
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
      <LocationMapDialog 
        open={mapOpen} 
        setOpen={setMapOpen} 
        location={post.location}
      />

      {/* Add Comment */}
      <div className="flex items-center justify-between border-t border-base-300 mt-2 pt-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full bg-transparent text-base-content placeholder:text-base-content/50"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-primary cursor-pointer font-medium ml-2"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;