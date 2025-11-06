import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Trash2 } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { setcities } from "../redux/postSlice";

const CitiesPost = () => {
  const dispatch = useDispatch();
  const { cities } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  // Track delete modal visibility & selected post ID
  const [showModal, setShowModal] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(null);

  // 🧹 Delete handler
  const handleDelete = async () => {
    if (!selectedCityId) return;

    try {
      await api.delete(`/post/deletecity/${selectedCityId}`);

      const updatedCities = cities.filter((city) => city._id !== selectedCityId);
      dispatch(setcities(updatedCities));

      toast.success("City post deleted successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting city post:", error);
      toast.error("Failed to delete post");
    }
  };

  // Open confirmation modal
  const confirmDelete = (id) => {
    setSelectedCityId(id);
    setShowModal(true);
  };

  return (
    <div className="w-full flex flex-col items-center mt-10 px-4">
      <h1 className="text-2xl font-bold mb-8 text-base-content">
        Explore Cities
      </h1>

      {/* 🪟 Delete Confirmation Dialog */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
          <div className="bg-base-100 p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-sm btn-error text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {cities && cities.length > 0 ? (
        <div className="flex flex-col gap-10 w-full max-w-6xl">
          {cities.map((city) => (
            <div
              key={city._id}
              className="relative card bg-base-100 shadow-md border border-base-300 w-full p-6 rounded-2xl"
            >
              {/* 🗑️ Delete Button (only author can see) */}
              {city.auther?._id === user?._id && (
                <button
                  onClick={() => confirmDelete(city._id)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
                  title="Delete Post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {/* 👤 Author Section */}
              <div className="flex items-center gap-4 mb-4">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img
                      src={city.auther?.profilePicture || "/default-avatar.png"}
                      alt={city.auther?.username || "User"}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">
                    {city.auther?.username}
                  </h2>
                  {city.location?.name && (
                    <p className="text-sm text-base-content/60">
                      📍 {city.location.name}
                    </p>
                  )}
                </div>
              </div>

              {/* 🏙️ City Image */}
              <div className="w-full rounded-xl overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-[400px] object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* 📝 City Info */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                <p className="text-base text-base-content/80 leading-relaxed">
                  {city.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-base-content/60 mt-10">No city posts available.</p>
      )}
    </div>
  );
};

export default CitiesPost;
