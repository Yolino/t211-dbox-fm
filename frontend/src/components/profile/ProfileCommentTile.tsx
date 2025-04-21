import React, { useState } from "react";
import EditIcon from "../../svg/EditIcon.tsx";
import DeleteIcon from "../../svg/DeleteIcon.tsx";

interface Publication {
  id: number;
}

interface Comment {
  id: number;
  text: string;
  publication: Publication;
  isBanned: boolean;
}

interface ProfileCommentTileProps {
  comment: Comment;
  index: number;
  isSelf: boolean;
  onEdit: () => void;
  onCloseTile: () => void;
  isExpanded: boolean;
  onCommentClick: (i: number) => void;
}

const ProfileCommentTile = ({ comment, index, isSelf, onEdit, onCloseTile, isExpanded, onCommentClick }: ProfileCommentTileProps) => {
  const handleDeleteClick = () => {console.log("placeholder func")};

  const [commentText, setCommentText] = useState("");
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };
  const handleEditComment = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(commentText);
  };

  return (
    <div
      onClick={() => { onCommentClick(comment.publication.id) }}
      className={`p-4 bg-gray-200 rounded-lg shadow-sm group ${comment.isBanned ? "bg-red-200 hover:bg-red-300 text-red-800" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
    >
      <li key={index} className="relative flex items-center justify-between">
        {isExpanded ? (
          <form onSubmit={handleEditComment} className="w-full">
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="comment"
                defaultValue={comment.text}
                onChange={handleCommentChange}
                className="mt-0 w-4/5 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="submit"
                value="Edit"
                className="w-1/5 px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200"
              />
            </div>
          </form>
        ) : (
          <p className="font-bold">{comment.text}</p>
        )}
        {isSelf && (
            <div className="flex items-center gap-3 ml-4">
              <EditIcon onClick={onEdit} styleClass={comment.isBanned && "text-red-800 hover:text-gray-800"} />
              <DeleteIcon onClick={handleDeleteClick} styleClass={comment.isBanned && "text-red-800 hover:text-gray-800"} />
            </div>
          )}
      </li>
    </div>
  );
};

export default ProfileCommentTile;
