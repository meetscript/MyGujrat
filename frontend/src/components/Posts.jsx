import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const { posts } = useSelector(store => store.post);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </div>

  )
}

export default Posts
