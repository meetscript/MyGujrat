import React, { useRef, useState } from 'react'
import { readFileAsDataURL } from '../lib/utils'
import { Loader2, ImagePlus, MapPin, X } from 'lucide-react'
import toast from "react-hot-toast";
import api from '../lib/axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts, setcities } from '../redux/postSlice'
import MapPicker from './Mappicker'

const CreatePost = ({ open, setOpen, type = "post", parentClose }) => {
  const imageRef = useRef()
  const [file, setFile] = useState("")
  const [caption, setCaption] = useState("")
  const [city, setCity] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [location, setLocation] = useState(null)
  const { posts, cities } = useSelector(store => store.post)
  const dispatch = useDispatch()

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      const dataUrl = await readFileAsDataURL(file)
      setImagePreview(dataUrl)
    }
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
      if (!city.trim()) {
        toast.error("Please enter the city name.")
        return
      }
      if (!caption.trim()) {
        toast.error("Please add a description.")
        return
      }
    } else {
      if (!caption.trim() || !file) {
        toast.error("Please add a caption and select an image.")
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
    formData.append("image", file)
    if (location) formData.append("location", JSON.stringify(location))

    try {
      setLoading(true)
      const endpoint = type === "city" ? "post/addcity" : "post/addpost"
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
     console.log(res.data);
      if (res.data.success) {
        if (type === "city") {
          dispatch(setcities([res.data.city, ...cities]))
        } else {
          dispatch(setPosts([res.data.post, ...posts]))
        }

        toast.success(res.data.message)
        setOpen(false)
        parentClose() // close PostOrCity dialog too
        setCaption("")
        setCity("")
        setFile("")
        setImagePreview("")
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
          {/* Close Button */}
          <button
            className="absolute top-2 right-3 text-error hover:text-error-content"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          <h2 className="text-lg font-semibold mb-4 text-center">
            Create New {type === "city" ? "City Post" : "Post"}
          </h2>

          {/* ✅ City Name Input (Only for City Type) */}
          {type === "city" && (
            <div className="form-control mb-3">
              <label className="label text-sm">City Name</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter city name"
              />
            </div>
          )}

          {/* Caption or Description */}
          <div className="form-control mb-3">
            <label className="label text-sm">
              {type === "city" ? "Description" : "Caption"}
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder={`Write ${type === "city" ? "description..." : "something..."}`}
              rows={3}
            />
          </div>
          
            <div className="form-control mb-3">
              <label className="label text-sm">Location</label>
              {location ? (
                <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="flex-1 text-sm">{location.name}</span>
                  <button onClick={removeLocation} className="btn btn-ghost btn-xs btn-circle">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMap(true)}
                  className="btn btn-outline btn-sm w-full"
                >
                  <MapPin className="w-4 h-4" />
                  Add Location
                </button>
              )}
            </div>

          {/* Image Upload */}
          <div
            className="border-2 border-dashed border-base-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-base-200 transition"
            onClick={() => imageRef.current.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
            ) : (
              <div className="flex flex-col items-center text-sm text-base-content/60">
                <ImagePlus className="w-8 h-8 mb-2" />
                <p>Click to upload image</p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            hidden
            ref={imageRef}
            onChange={fileChangeHandler}
          />

          {/* Submit Button */}
          <button
            onClick={createPostHandler}
            disabled={loading}
            className="btn btn-primary w-full mt-5"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              `Create ${type === "city" ? "City Post" : "Post"}`
            )}
          </button>
        </div>
      </div>

      {/* Map Picker Modal */}
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
