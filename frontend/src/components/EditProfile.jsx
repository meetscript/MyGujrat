import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../lib/axios";
import { Loader2, Camera,User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { setAuthUser } from "../redux/authSlice";

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilePhoto: file });
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await api.put("user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender,
        };
        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-start p-4 md:p-8">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body space-y-6">
          <h1 className="text-2xl font-bold text-primary text-center">
            Edit Profile
          </h1>

          {/* Profile Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-200 rounded-xl p-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    input.profilePhoto instanceof File
                      ? URL.createObjectURL(input.profilePhoto)
                      : user?.profilePicture
                  }
                  alt="profile"
                  className="w-16 h-16 rounded-full object-cover border border-gray-300"
                />
                <button
                  onClick={() => imageRef.current.click()}
                  className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full hover:bg-primary/80 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h1 className="font-semibold text-base">{user?.username}</h1>
                <span className="text-sm text-base-content/70">
                  {user?.bio || "No bio yet"}
                </span>
              </div>
            </div>

            <input
              ref={imageRef}
              onChange={fileChangeHandler}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Bio Section */}
          <div>
            <h2 className="font-semibold mb-2">Bio</h2>
            <textarea
              value={input.bio}
              onChange={(e) => setInput({ ...input, bio: e.target.value })}
              name="bio"
              placeholder="Write something about yourself..."
              className="textarea textarea-bordered w-full min-h-[100px]"
            />
          </div>

          {/* Gender Section */}
          <div>
            <h2 className="font-semibold mb-2">Gender</h2>
            <select
              value={input.gender}
              onChange={(e) => selectChangeHandler(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            {loading ? (
              <button className="btn btn-primary w-fit gap-2" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait
              </button>
            ) : (
              <button
                onClick={editProfileHandler}
                className="btn btn-primary w-fit"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
