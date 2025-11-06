import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import api from "../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { setSearchResults } from "../redux/authSlice";
import { Link } from "react-router-dom";
const SearchUser = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.auth);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() !== "") {
        try {
          const response = await api.get(`/user/search?q=${query}`);
          dispatch(setSearchResults(response.data));
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        dispatch(setSearchResults([]));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, dispatch]);

  return (
    <div className="w-full flex justify-center mt-6 px-3">
      {/* Center container */}
      <div className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username..."
          className="input input-bordered w-full text-sm sm:text-base"
        />

        {/* Search results */}
        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <div className="mt-2 bg-base-100 shadow-lg rounded-box overflow-hidden">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-3 hover:bg-base-200 transition cursor-pointer"
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                )}
                <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUser;
