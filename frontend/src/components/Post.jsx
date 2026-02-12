import React, { useState } from 'react'
import { Bookmark, MessageCircle, MoreHorizontal, Send, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import LocationMapDialog from './LocationMapDialog'
import { useDispatch, useSelector } from 'react-redux'
import toast from "react-hot-toast";
import { setPosts, setSelectedPost } from '../redux/postSlice'
import api from '../lib/axios'
import ShareDialog from './ShareDialog'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom';

const Post = ({ post }) => {
  // console.log("post in post component:", post);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = post.images?.length
    ? post.images
    : post.image
      ? [post.image]
      : [];
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { user, msgusers } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [saved, setSaved] = useState(user.Bookmarks?.includes(post._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    setText(inputText.trim() ? inputText : "");
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
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
      setSaved(!saved);
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
    <>
    <div
      className="
    w-full 
    rounded-2xl 
    bg-base-100 
    shadow-sm 
    hover:shadow-xl 
    hover:-translate-y-1 
    transition-all duration-300 ease-out
    p-3
  ">
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

          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm text-base-content">
              {post.author?.username}
            </h1>
            {user?._id === post.author._id && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-base-200 text-base-content/70">
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
              className="
            absolute right-0 mt-2 
            bg-base-100 
            border border-base-300 
            shadow-lg 
            rounded-xl 
            w-40 
            text-sm 
            flex flex-col 
            z-10
          "
            >
              {post?.author?._id !== user?._id && (
                <button className="px-4 py-2 text-error hover:bg-base-200 text-left">
                  Unfollow
                </button>
              )}
              <button className="px-4 py-2 hover:bg-base-200 text-left">
                Add to favorites
              </button>
              {user && user?._id === post?.author._id && (
                <button
                  onClick={deletePostHandler}
                  className="px-4 py-2 hover:bg-base-200 text-left"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      {post.location?.name && (
        <div
          onClick={handleLocationClick}
          className="
        flex items-center gap-1 
        mt-1 
        text-xs 
        text-base-content/60 
        cursor-pointer 
        hover:text-primary
      "
        >
          <MapPin className="w-3 h-3" />
          <span className="truncate">{post.location.name}</span>
        </div>
      )}

      {/* Image */}
      {images.length > 0 && (
        <div className="relative my-2 overflow-hidden rounded-xl">
          <img
            src={images[currentImageIndex]}
            alt="post"
            className="
          w-full 
          object-cover 
          rounded-xl
          min-h-[260px]
          max-h-[520px]
        "
          />

          {/* Left */}
          <button
            onClick={prevImage}
            disabled={currentImageIndex === 0}
            className="
          absolute left-2 top-1/2 -translate-y-1/2 
          bg-black/60 text-white 
          p-1 rounded-full
          disabled:opacity-40
        "
          >
            <ChevronLeft />
          </button>

          {/* Right */}
          <button
            onClick={nextImage}
            disabled={currentImageIndex === images.length - 1}
            className="
          absolute right-2 top-1/2 -translate-y-1/2 
          bg-black/60 text-white 
          p-1 rounded-full
          disabled:opacity-40
        "
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between my-2 text-base-content/80">
        <div className="flex items-center gap-4">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={22}
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
            onClick={() => navigate(`/post/${post._id}`)}
            className="cursor-pointer hover:text-primary"
          />

          <Send
            onClick={() => setShareOpen(true)}
            className="cursor-pointer hover:text-primary"
          />
        </div>

        <Bookmark
          onClick={bookmarkHandler}
          className="cursor-pointer hover:text-primary"
        />
      </div>

      {/* Likes */}
      <span className="block text-sm font-medium mb-1">
        {postLike} likes
      </span>

      {/* Caption */}
      <div className="text-sm leading-relaxed">
        <span className="font-medium mr-1">
          {post.author?.username}
        </span>
        <p className="text-sm leading-relaxed">
          <span className="font-medium mr-1">
            {post.author?.username}
          </span>

          <span className={expanded ? "" : "line-clamp-2"}>
            {post.caption}
          </span>

          {post.caption?.length > 120 && (
            <span
              onClick={() => setExpanded(!expanded)}
              className="text-base-content/60 cursor-pointer ml-1 select-none"
            >
              {expanded ? "Show less" : "Read more"}
            </span>
          )}
        </p>

      </div>

      {/* Comments */}
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="block mt-1 text-xs text-base-content/60 cursor-pointer"
        >
          View all {comment.length} comments
        </span>
      )}

      {/* Add Comment */}
      <div className="flex items-center gap-2 border-t border-base-300 mt-2 pt-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="
        w-full 
        bg-transparent 
        outline-none 
        text-sm 
        placeholder:text-base-content/50
      "
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-primary cursor-pointer font-medium"
          >
            Post
          </span>
        )}
      </div>
    </div>
    
      <ShareDialog
        className={cn("w-full h-full z-1000", !shareOpen && "hidden")}  
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        msgusers={msgusers}
        postId={post._id}
      />

      <LocationMapDialog
        open={mapOpen}
        setOpen={setMapOpen}
        location={post.location}
      />

    </>);

};

export default Post;