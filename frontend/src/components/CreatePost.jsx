import React, { useRef, useState } from 'react'
import { readFileAsDataURL } from '../lib/utils'
import { Loader2, ImagePlus, MapPin, X } from 'lucide-react'
import toast from "react-hot-toast";
import api from '../lib/axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts, setcities } from '../redux/postSlice'
import MapPicker from './MapPicker'

const MAX_IMAGES = 10;

const CreatePost = ({ open, setOpen, type = "post", parentClose }) => {
  const imageRef = useRef()

  // ⭐ changed states
  const [files, setFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const [caption, setCaption] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [location, setLocation] = useState(null)

  const { posts, cities } = useSelector(store => store.post)
  const dispatch = useDispatch()

  // ⭐ multiple file handler
  const fileChangeHandler = async (e) => {
    const selectedFiles = Array.from(e.target.files)

    if (selectedFiles.length > MAX_IMAGES) {
      toast.error(`You can upload max ${MAX_IMAGES} images`)
      return
    }

    setFiles(selectedFiles)

    const previews = await Promise.all(
      selectedFiles.map(file => readFileAsDataURL(file))
    )

    setImagePreviews(previews)
  }

  const handleLocationSelect = (locationData) => {
    setLocation(locationData)
    setShowMap(false)
    toast.success("Location added!")
  }

  const removeLocation = () => {
    setLocation(null)
    toast.success("Location removed")
  }

  const createPostHandler = async () => {
    // Validation
    if (type === "city") {
      if (!city.trim() || !caption.trim()) {
        toast.error("City name and description required")
        return
      }
    } else {
      if (!caption.trim() || files.length === 0) {
        toast.error("Caption and at least one image required")
        return
      }
    }

    const formData = new FormData()

    if (type === "city") {
      formData.append("name", city)
      formData.append("description", caption)
    } else {
      formData.append("caption", caption)
    }

    // ⭐ append multiple images
    files.forEach(file => {
      formData.append("images", file)
    })

    if (location) {
      formData.append("location", JSON.stringify(location))
    }

    try {
      setLoading(true)
      const endpoint = type === "city" ? "post/addcity" : "post/addpost"

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })

      if (res.data.success) {
        if (type === "city") {
          dispatch(setcities([res.data.city, ...cities]))
        } else {
          dispatch(setPosts([res.data.post, ...posts]))
        }

        toast.success(res.data.message)
        setOpen(false)
        parentClose()

        // ⭐ reset
        setCaption("")
        setCity("")
        setFiles([])
        setImagePreviews([])
        setLocation(null)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create post.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg w-96 relative max-h-[90vh] overflow-y-auto">

          <button
            className="absolute top-2 right-3 text-error"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          <h2 className="text-lg font-semibold mb-4 text-center">
            Create New {type === "city" ? "City Post" : "Post"}
          </h2>

          {/* City Name */}
          {type === "city" && (
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input input-bordered w-full mb-3"
              placeholder="City name"
            />
          )}

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="textarea textarea-bordered w-full mb-3"
            placeholder="Write something..."
          />

          {/* Location */}
          <div className="mb-3">
            {location ? (
              <div className="flex items-center gap-2 p-2 bg-base-200 rounded">
                <MapPin size={16} />
                <span className="flex-1 text-sm">{location.name}</span>
                <X onClick={removeLocation} className="cursor-pointer" />
              </div>
            ) : (
              <button
                onClick={() => setShowMap(true)}
                className="btn btn-outline btn-sm w-full"
              >
                Add Location
              </button>
            )}
          </div>

          {/* ⭐ Image Upload */}
          <div
            onClick={() => imageRef.current.click()}
            className="border-2 border-dashed rounded-xl p-4 cursor-pointer"
          >
            {imagePreviews.length ? (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="h-24 w-full object-cover rounded"
                    alt=""
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm opacity-60">
                <ImagePlus className="mx-auto mb-1" />
                Click to upload images
              </div>
            )}
          </div>

          <input
            type="file"
            multiple // ⭐
            accept="image/*"
            hidden
            ref={imageRef}
            onChange={fileChangeHandler}
          />

          <button
            onClick={createPostHandler}
            disabled={loading}
            className="btn btn-primary w-full mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Post"}
          </button>
        </div>
      </div>

      {showMap && (
        <MapPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  )
}

export default CreatePost
