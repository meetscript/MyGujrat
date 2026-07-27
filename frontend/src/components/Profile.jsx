import React, { useEffect, useState } from 'react';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AtSign, Heart, MessageCircle, User, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { setSelectedUser, setUserProfile } from '../redux/authSlice';
import FollowDialog from './followdialog.jsx';
import { setSelectedPost } from '../redux/postSlice';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();
const navigate = useNavigate();
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const { userProfile, user} = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const [isFollowing, setIsFollowing] = useState(false);

  const [[type, openFollower], setOpenFollower] = useState(['followers', false]);

  useEffect(() => {
    if (userProfile && user) {
      const followingStatus = userProfile.followers?.some(
        (f) =>
          f._id?.toString() === user._id?.toString() ||
          f?.toString() === user._id?.toString()
      );
      setIsFollowing(followingStatus);
    }
  }, [userProfile, user]);
  console.log('isFollowing:', isFollowing);

  const followingHandler = async () => {
    try {
      const res = await api.post(
        `user/followorunfollow/${userProfile?._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const isFollowingNow = !isFollowing;
        setIsFollowing(isFollowingNow);

        const updatedFollowers = isFollowingNow
          ? [...userProfile.followers, user._id]
          : userProfile.followers.filter(
            (f) =>
              f._id?.toString() !== user._id?.toString() &&
              f?.toString() !== user._id?.toString()
          );

        const updatedUserProfile = {
          ...userProfile,
          followers: updatedFollowers,
        };

        dispatch(setUserProfile(updatedUserProfile));
        toast.success(res.data.message);
        console.log(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong, can't follow/unfollow user");
    }
  };
  const handleTabChange = (tab) => setActiveTab(tab);
  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className="flex max-w-5xl justify-center mx-auto px-4">
      <div className="flex flex-col gap-20 p-8 w-full">
        {/* Profile Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <section className="flex items-center justify-center md:justify-start">
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                {userProfile?.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="profilephoto"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Profile Info */}
          <section className="col-span-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="text-2xl font-light">{userProfile?.username}</span>

                <div className="flex flex-wrap gap-2">
                  {isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit">
                        <button className="btn btn-outline btn-sm hover:bg-gray-100">Edit profile</button>
                      </Link>
                      <button className="btn btn-outline btn-sm hover:bg-gray-100">View archive</button>
                      <button className="btn btn-outline btn-sm hover:bg-gray-100">Ad tools</button>
                    </>
                  ) : isFollowing ? (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={followingHandler}>Unfollow</button>
                         <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          dispatch(setSelectedUser(userProfile));
                          navigate('/chat');
                        }}
                      >
                        Message
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={followingHandler}>Follow</button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          dispatch(setSelectedUser(userProfile));
                          navigate('/chat');
                        }}
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <p><span className="font-semibold">{userProfile?.posts?.length || 0}</span> posts</p>
                <p><span className="font-semibold">{userProfile?.followers?.length || 0}</span><button onClick={() => setOpenFollower(['followers', true])}>followers</button> </p>
                <p><span className="font-semibold">{userProfile?.following?.length || 0}</span> <button onClick={() => setOpenFollower(['following', true])}>following</button></p>
              </div>
              <FollowDialog
                open={openFollower}
                onClose={() => setOpenFollower(['followers', false])}
                followers={type === 'followers' ? userProfile?.followers || [] : userProfile?.following || []}
                type={type}
              />
              <div className="flex flex-col gap-2">
                <span className="font-semibold">{userProfile?.bio || 'bio here...'}</span>
                <div className="badge badge-outline gap-1 w-fit">
                  <AtSign className="w-3 h-3" />
                  <span>{userProfile?.username}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Posts Section */}
        <div className="border-t border-gray-200">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-10 text-sm">
            {['posts', 'saved', 'reels', 'tags'].map(tab => (
              <button
                key={tab}
                className={cn(
                  "py-3 cursor-pointer border-t-2 transition-all",
                  activeTab === tab
                    ? 'font-bold border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
                onClick={() => handleTabChange(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
  {displayedPost?.map((post) => (
    <div
      onClick={() => {
        dispatch(setSelectedPost(post));
        navigate(`/post/${post._id}`);
      }}
      key={post?._id}
      className="relative group cursor-pointer rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        background: "#18181b",
        transition: "transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.22)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.10)";
      }}
    >
      {/* Image */}
      <img
        src={post.images?.[0]}
        alt="post"
        className="w-full h-[280px] object-cover block"
        style={{ transition: "filter 0.3s" }}
      />

      {/* Hover Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(30,10,60,0.72) 100%)",
          backdropFilter: "blur(2px)",
          transition: "opacity 0.3s",
        }}
      >
        {/* Stats Row */}
        <div className="flex items-center gap-8">
          {/* Likes */}
          <div className="flex flex-col items-center gap-1 text-white">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-xl font-bold" style={{ fontFamily: "Georgia, serif", letterSpacing: "0.02em" }}>
                {post?.likes?.length || 0}
              </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-white/70">Likes</span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.25)", borderRadius: 1 }} />

          {/* Comments */}
          <div className="flex flex-col items-center gap-1 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xl font-bold" style={{ fontFamily: "Georgia, serif", letterSpacing: "0.02em" }}>
                {post?.comments?.length || 0}
              </span>
            </div>
            <span className="text-xs uppercase tracking-widest text-white/70">Comments</span>
          </div>
        </div>

        {/* View Post label */}
        <div
          className="mt-5 px-5 py-1.5 rounded-full text-xs tracking-widest uppercase text-white/90 border border-white/30"
          style={{ background: "rgba(255,255,255,0.10)", letterSpacing: "0.15em" }}
        >
          View Post
        </div>
      </div>
    </div>
  ))}
</div>
          {/* Empty State */}
          {(!displayedPost || displayedPost.length === 0) && (
            <div className="text-center py-16 text-gray-500">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xl font-light">No {activeTab === 'posts' ? 'posts' : 'saved posts'} yet</p>
                <p className="text-sm">
                  When you {activeTab === 'posts' ? 'share photos' : 'save posts'}, they'll appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
