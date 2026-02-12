import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const { posts } = useSelector(store => store.post);

  return (
    <div
      className="
        columns-1 
        sm:columns-2 
        lg:columns-3 
        gap-6
        max-w-6xl 
        mx-auto
        px-4
        h-full
      "
    >
      {posts.map(post => (
        <div key={post._id} className="break-inside-avoid mb-6">
          <Post post={post} />
        </div>
      ))}
    </div>
  )
}

export default Posts
