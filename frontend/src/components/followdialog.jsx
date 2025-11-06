import React from 'react';
import { X, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom'
const FollowersDialog = ({ open, onClose, followers = [], type = 'followers' }) => {
  if (!open) return null;

  const isFollowers = type === 'followers';
  const title = isFollowers ? 'Followers' : 'Following';
  const emptyMessage = isFollowers 
    ? "When someone follows you, they'll appear here."
    : "When you follow someone, they'll appear here.";
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-base-content" />
            <h3 className="font-semibold text-base">
              {title} ({followers.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {followers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-base-content/60">
              <Users size={48} className="mb-2 opacity-50" />
              <p className="text-lg font-medium">No {title.toLowerCase()} yet</p>
              <p className="text-sm mt-1 text-center">{emptyMessage}</p>
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {followers.map((follower, index) => (
                <div
                  key={follower.username || index}
                  className="flex items-center gap-3 p-4 hover:bg-base-200 transition-colors cursor-pointer"
                >
                  {/* Avatar with fallback to User icon */}
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center">
                      {follower.userprofilepic ? (
                        <img
                          src={follower.userprofilepic}
                          alt={follower.username}
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <User size={24} className="text-base-content/60" />
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base truncate">
                      <Link to={`/profile/${follower?._id}`}>{follower?.username||'unknown user'}</Link>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action p-4 border-t border-base-300">
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default FollowersDialog;