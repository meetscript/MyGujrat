import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { X ,User} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import api from '../lib/axios'
import { toast } from 'react-hot-toast'
import { setPosts } from '../redux/postSlice'

const CommentDialog = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [text, setText] = useState("")
  const [comment, setComment] = useState([])
const [currentIndex, setCurrentIndex] = useState(0)
  const { posts } = useSelector((store) => store.post)
  const post = posts.find((p) => p._id === id)
 
  const dispatch = useDispatch()

  // ✅ Handle both old & new image schema
const images = post?.images?.length
  ? post.images
  : post?.image
  ? [post.image]
  : []
const canGoLeft = currentIndex > 0
const canGoRight = currentIndex < images.length - 1

const handlePrev = () => {
  if (canGoLeft) setCurrentIndex(prev => prev - 1)
}

const handleNext = () => {
  if (canGoRight) setCurrentIndex(prev => prev + 1)
}


  useEffect(() => {
    if (post) {
      setComment(post.comments)
    }
  }, [post])

  const changeEventHandler = (e) => {
    const inputText = e.target.value
    setText(inputText.trim() ? inputText : "")
  }

  const sendMessageHandler = async () => {
    try {
      const res = await api.post(
        `post/${post?._id}/comment`,
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment]
        setComment(updatedCommentData)

        const updatedPostData = posts.map(p =>
          p._id === post._id
            ? { ...p, comments: updatedCommentData }
            : p
        )

        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
        setText("")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-base-100 rounded-2xl shadow-2xl w-[92vw] max-w-6xl h-[85vh] flex overflow-hidden">

      {/* LEFT: IMAGE SLIDER */}
<div className="relative w-1/2 h-full bg-black flex items-center justify-center">

  {images.length > 0 ? (
    <>
      <img
        src={images[currentIndex]}
        alt="post"
        className="w-full h-full object-contain"
      />

      {/* LEFT CHEVRON */}
      <button
        onClick={handlePrev}
        disabled={!canGoLeft}
        className={`absolute left-4 btn btn-circle btn-sm 
          ${canGoLeft ? 'btn-neutral' : 'btn-disabled opacity-40'}`}
      >
        ❮
      </button>

      {/* RIGHT CHEVRON */}
      <button
        onClick={handleNext}
        disabled={!canGoRight}
        className={`absolute right-4 btn btn-circle btn-sm 
          ${canGoRight ? 'btn-neutral' : 'btn-disabled opacity-40'}`}
      >
        ❯
      </button>

      {/* IMAGE INDEX DOTS (optional but 🔥) */}
      <div className="absolute bottom-4 flex gap-2">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 w-2 rounded-full 
              ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </>
  ) : (
    <p className="text-white/60">No image available</p>
  )}
</div>


        {/* RIGHT: COMMENTS */}
        <div className="w-1/2 flex flex-col">

          {/* HEADER */}
          <div className="flex items-center gap-3 p-4 border-b border-base-300">
            <Link to={`/profile/${post?.author?._id}`}>
                           {post?.user?.profilePicture ? (
                             <img
                               src={post?.user?.profilePicture}
                               alt="user_profile"
                               className="w-12 h-12 rounded-full object-cover border border-base-300 hover:opacity-90 transition"
                             />
                           ) : (
                             <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center border border-base-300">
                               <User className="w-6 h-6 text-gray-600" />
                             </div>
                           )}
            </Link>
            <Link
              className="font-semibold hover:underline"
              to={`/profile/${post?.author?._id}`}
            >
              {post?.author?.username || "Unknown User"}
            </Link>
          </div>

          {/* COMMENTS LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-base-300">
            {comment.length > 0 ? (
              comment.map((c) => (
                <Comment key={c._id} comment={c} />
              ))
            ) : (
              <p className="text-sm text-center text-base-content/60 mt-10">
                No comments yet. Be the first 💬
              </p>
            )}
          </div>

          {/* ADD COMMENT */}
          <div className="p-4 border-t border-base-300">
            <div className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={changeEventHandler}
                placeholder="Write a comment..."
                className="input input-bordered input-sm w-full focus:outline-none"
              />
              <button
                disabled={!text.trim()}
                onClick={sendMessageHandler}
                className="btn btn-sm btn-primary px-6 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default CommentDialog
