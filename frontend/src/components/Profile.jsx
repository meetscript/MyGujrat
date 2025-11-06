import React, { useEffect, useState } from 'react';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AtSign, Heart, MessageCircle, User, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { setUserProfile } from '../redux/authSlice';
import FollowDialog from './followdialog.jsx';
import CommentDialog from './CommentDialog.jsx';
import { setSelectedPost } from '../redux/postSlice';
const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();

  useGetUserProfile(userId);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const { userProfile, user } = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const [isFollowing, setIsFollowing] = useState(false);

  const [[type,openFollower], setOpenFollower] = useState(['followers',false]);

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
                      <button className="btn btn-outline btn-sm">Message</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={followingHandler}>Follow</button>
                      <button className="btn btn-outline btn-sm">Message</button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <p><span className="font-semibold">{userProfile?.posts?.length || 0}</span> posts</p>
                <p><span className="font-semibold">{userProfile?.followers?.length || 0}</span><button onClick={() => setOpenFollower(['followers',true])}>followers</button> </p>
                <p><span className="font-semibold">{userProfile?.following?.length || 0}</span> <button onClick={() => setOpenFollower(['following',true])}>following</button></p>
              </div>
              <FollowDialog
                open={openFollower}
                onClose={() => setOpenFollower(['followers',false])}
                followers={type==='followers'?userProfile?.followers || []: userProfile?.following || []}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {displayedPost?.map((post) => (
              <div  onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                          }}
                key={post?._id}
                className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img
                  src={post.image}
                  alt="postimage"
                  className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
                  <div className="flex items-center text-white space-x-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">{post?.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{post?.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
     <CommentDialog open={open} setOpen={setOpen} />
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
