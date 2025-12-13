import { useState } from "react";
import { User as UserIcon } from "lucide-react";
import api from "../lib/axios";

export default function ShareDialog({ open, onClose, msgusers ,postId }) {
  const msg="this fucking person shared a post with you";
  const [selectedUsers, setSelectedUsers] = useState([]);
  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId) // remove
        : [...prev, userId] // add
    );
  };

  
  const handleSend = async () => {
    try {
      if (selectedUsers.length === 0) return;
      for (const receiverId of selectedUsers) {
        await api.post(
          `message/send/post/${receiverId}`,
        { textMessage: msg, postId },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      }

      setSelectedUsers([]);
      onClose(); // close modal
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-base-200 rounded-xl shadow-xl w-[90%] max-w-md p-5 border border-base-300 animate-fadeIn">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-base-content">Share Post</h2>
              <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
            </div>

            {/* Users List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {msgusers?.map((msguser) => (
                <div
                  key={msguser._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-base-100 border border-base-300 hover:bg-base-300/40 transition"
                >
                  <div className="flex items-center gap-3">
                    {msguser.profilePicture ? (
                      <img
                        src={msguser.profilePicture}
                        className="w-12 h-12 rounded-full object-cover border border-base-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center border border-base-300">
                        <UserIcon className="w-6 h-6 text-base-content/70" />
                      </div>
                    )}

                    <p className="font-medium text-base-content">{msguser.username}</p>
                  </div>

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedUsers.includes(msguser._id)}
                    onChange={() => toggleUser(msguser._id)}
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-5">
              <button
                className="btn btn-primary w-full"
                disabled={selectedUsers.length === 0}
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}