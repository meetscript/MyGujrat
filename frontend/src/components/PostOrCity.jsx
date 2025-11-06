import React, { useState } from "react";
import CreatePost from "./CreatePost";

const PostOrCity = ({ open, setOpen }) => {
  const [type, setType] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const handleSelect = (selectedType) => {
    setType(selectedType);
    setCreateOpen(true);
  };

  if (!open) return null;

  return (
    <>
      {/* Selection Dialog */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-base-100 rounded-xl p-5 w-80 shadow-lg">
          <h2 className="text-lg font-semibold text-center mb-4">
            What would you like to create?
          </h2>

          <div className="flex gap-3 mb-4">
            <button
              className="btn btn-sm btn-primary flex-1"
              onClick={() => handleSelect("post")}
            >
              Post
            </button>
            <button
              className="btn btn-sm btn-outline flex-1"
              onClick={() => handleSelect("city")}
            >
              City
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setOpen(false)}
              className="btn btn-sm btn-neutral w-24"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* CreatePost Dialog */}
      {createOpen && (
        <CreatePost
          open={createOpen}
          setOpen={setCreateOpen}
          type={type}
          parentClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default PostOrCity;
