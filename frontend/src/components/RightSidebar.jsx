import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { User, ChevronLeft, ChevronRight } from 'lucide-react'
import SuggestedUsers from './SuggestedUsers'

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button for Small Screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-1/2 right-2 z-50 btn btn-circle btn-sm bg-base-200 shadow-md hover:bg-base-300 transition"
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-base-100 shadow-lg transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        lg:translate-x-0 lg:static lg:w-80 lg:shadow-none lg:block`}
      >
        <div className="p-5 mt-16 lg:mt-10">
          {/* User Info Section */}
          <div className="flex items-center gap-3">
            <Link to={`/profile/${user?._id}`}>
              {user?.profilePicture ? (
                <img
                  src={user?.profilePicture}
                  alt="user_profile"
                  className="w-12 h-12 rounded-full object-cover border border-base-300 hover:opacity-90 transition"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center border border-base-300">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </Link>

            <div>
              <h1 className="font-semibold text-sm hover:underline">
                <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
              </h1>
            </div>
          </div>

          {/* Suggested Users Section */}
          <div className="mt-6 border-t border-base-300 pt-4">
            <SuggestedUsers />
          </div>
        </div>
      </div>
    </>
  )
}

export default RightSidebar
