import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { User as UserIcon } from 'lucide-react'

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector(store => store.auth);

  return (
   <div className="my-10">
  {/* Header */}
  <div className="flex items-center justify-between text-sm mb-4">
    <h1 className="font-semibold text-base-content/70">Suggested for you</h1>
    <span className="font-medium text-base-content/80 cursor-pointer hover:underline">
      See All
    </span>
  </div>

  {suggestedUsers.map((user) => (
    <div
      key={user._id}
      className="flex items-center justify-between my-3 hover:bg-base-200 p-2 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user?._id}`}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="user avatar"
              className="w-10 h-10 rounded-full object-cover border border-base-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
              <UserIcon className="text-base-content/60 w-5 h-5" />
            </div>
          )}
        </Link>

        <div>
          <h1 className="font-semibold text-sm text-base-content">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
        </div>
      </div>

      <span className="text-primary text-xs font-bold cursor-pointer hover:text-primary-focus">
        Follow
      </span>
    </div>
  ))}
</div>

  )
}

export default SuggestedUsers
