import React, { useState } from 'react';
import { 
  Heart, Home, LogOut, MessageCircle, PlusSquare, 
  Search, TrendingUp, User, Menu ,Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PostOrCity from './PostOrCity';
import { setAuthUser } from '../redux/authSlice';
import { setPosts, setSelectedPost } from '../redux/postSlice';
import { persistor } from "../redux/store";
import api from '../lib/axios';


const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await api.get('/user/logout', { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        localStorage.clear();
        sessionStorage.clear();
        await persistor.purge();
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === 'Logout') logoutHandler();
    else if (textType === "Create") setOpen(true);
    else if (textType === "Profile") navigate(`/profile/${user?._id}`);
    else if (textType === "Home") navigate("/");
    else if (textType === "citypost") navigate("/citiespost");
    else if (textType === 'Messages') navigate("/chat");
    else if( textType === 'Search') navigate("/search");
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Building2 />, text: "citypost" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    { icon: <User />, text: "Profile" },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <>
      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-base-100 border-r border-base-300 p-5 flex flex-col justify-between z-20
        transition-all duration-900 ease-in-out
        ${expanded ? 'w-56' : 'w-20'}`}
      >
        {/* TOP SECTION */}
        <div>
          {/* HEADER + TOGGLE BUTTON */}
          <div className="flex items-center justify-between mb-10">
            <h1
              className={`text-2xl font-bold text-primary transition-opacity duration-500
              ${expanded ? 'opacity-100' : 'opacity-0 hidden'}`}
            >
              MySocial
            </h1>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg hover:bg-base-200 transition"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* SIDEBAR ITEMS */}
          <ul className="space-y-4">
            {sidebarItems.map((item, index) => (
              <li
                key={index}
                onClick={() => sidebarHandler(item.text)}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-all"
              >
                <span className="text-base-content">{item.icon}</span>
                <span
                  className={`text-sm font-medium text-base-content transition-all duration-500
                  ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 hidden'}`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* USER PROFILE SECTION */}
        <div
          className={`flex items-center gap-3 mt-6 transition-all duration-500
          ${expanded ? 'justify-start' : 'justify-center'}`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-base-300 flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-base-content">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div
            className={`transition-all duration-500
            ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5 hidden'}`}
          >
            <p className="font-semibold text-sm text-base-content">{user?.username}</p>
          </div>
        </div>
      </aside>

      {/* POST/CITY MODAL */}
      <PostOrCity open={open} setOpen={setOpen} />
    </>
  );
};

export default LeftSidebar;
