import React, { use, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUser } from '../redux/authSlice';
import { MessageCircleCode, User } from 'lucide-react';
import Messages from './Messages';
import { setMessages } from '../redux/chatSlice';
import api from '../lib/axios';
import usegetmsgusers from '../hooks/usegetmsgusers';
const ChatPage = () => {
    usegetmsgusers();
    const [textMessage, setTextMessage] = useState("");
    const { user, selectedUser, msgusers } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await api.post(`message/send/${receiverId}`, { textMessage }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        };
    }, [dispatch]);
    return (
        <div className="flex ml-[16%] h-screen">

            <section className="w-full md:w-1/4 my-8">
                <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
                <hr className="mb-4 border-gray-300" />
                <div className="overflow-y-auto h-[80vh]">
                    {Array.isArray(msgusers) && msgusers.length > 0 ? (
                        msgusers.map((msguser) => {
                            const isOnline = onlineUsers.includes(msguser?._id);
                            return (
                                <div
                                    key={msguser._id}
                                    onClick={() => dispatch(setSelectedUser(msguser))}
                                    className="flex gap-3 items-center p-3 hover:bg-base-200 cursor-pointer transition rounded-lg"
                                >
                                    {/* Avatar */}
                                    <div className="avatar">
                                        <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-base-200 overflow-hidden">
                                            {msguser?.profilePicture ? (
                                                <img
                                                    src={msguser.profilePicture}
                                                    alt="profile"
                                                    className="object-cover w-full h-full rounded-full"
                                                />
                                            ) : (
                                                <User className="text-gray-500 w-6 h-6" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Username and status */}
                                    <div className="flex flex-col">
                                        <span className="font-medium text-base">{msguser?.username}</span>
                                        <span
                                            className={`text-xs font-semibold ${isOnline ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {isOnline ? "online" : "offline"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 mt-4">No users available</p>
                    )}

                </div>
            </section>

            {/* Chat Area */}
            {selectedUser ? (
                <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex gap-3 items-center px-4 py-3 border-b border-gray-300 sticky top-0 bg-base-100 z-10">
                        <div className="avatar">
                            <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-base-200 overflow-hidden">
                                {selectedUser?.profilePicture ? (
                                    <img
                                        src={selectedUser.profilePicture}
                                        alt="profile"
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                ) : (
                                    <User className="text-gray-500 w-5 h-5" />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg">{selectedUser?.username}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <Messages selectedUser={selectedUser} />

                    {/* Input */}
                    <div className="flex items-center p-4 border-t border-t-gray-300 bg-base-100">
                        <input
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                            type="text"
                            className="input input-bordered w-full mr-2 focus:outline-none"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={() => sendMessageHandler(selectedUser?._id)}
                            className="btn btn-primary"
                        >
                            Send
                        </button>
                    </div>
                </section>
            ) : (
                <div className="flex flex-col items-center justify-center mx-auto">
                    <MessageCircleCode className="w-32 h-32 my-4 text-primary" />
                    <h1 className="font-medium text-lg">Your messages</h1>
                    <span className="text-sm text-gray-500">Send a message to start a chat.</span>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
