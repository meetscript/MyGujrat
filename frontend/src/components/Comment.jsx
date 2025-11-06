import React from 'react'
import { User } from 'lucide-react'

const Comment = ({ comment }) => {
    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                {/* DaisyUI Avatar */}
                <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                        {comment?.author?.profilePicture ? (
                            <img 
                                src={comment.author.profilePicture} 
                                alt={comment?.author.username}
                                className="object-cover"
                            />
                        ) : (
                            <div className="bg-neutral-focus text-neutral-content w-full h-full rounded-full flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                </div>
                
                <h1 className='font-bold text-sm'>
                    {comment?.author.username} 
                    <span className='font-normal pl-1'>{comment?.text}</span>
                </h1>
            </div>
        </div>
    )
}

export default Comment