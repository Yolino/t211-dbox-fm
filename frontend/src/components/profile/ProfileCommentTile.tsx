import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import UPDATE_COMMENT_MUTATION from "../../graphql/updateCommentMutation.ts";
import DELETE_COMMENT_MUTATION from "../../graphql/deleteCommentMutation.ts";
import DeleteContentCard from "./DeleteContentCard.tsx";
import PlayIcon from "../../svg/PlayIcon.tsx";
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

interface Message {
  isError: boolean;
  text: string;
}

interface ProfileCommentTileProps {
  comment: Comment;
  index: number;
  isSelf: boolean;
  onEdit: () => void;
  onCloseTile: () => void;
  isExpanded: boolean;
  message: Message;
  onSetMessage: (m: Message) => void;
  onProfileUpdate: () => void;
  onCommentClick: (i: number) => void;
}

const ProfileCommentTile = ({ comment, index, isSelf, onEdit, onCloseTile, isExpanded, message, onSetMessage, onProfileUpdate, onCommentClick }: ProfileCommentTileProps) => {
  const [isDeleteCardOpen, setIsDeleteCardOpen] = useState(false);
  const handleDeleteClick = () => {
    setIsDeleteCardOpen(true);
  };
  const handleCloseCard = () => {
    setIsDeleteCardOpen(false);
  };
  const [commentText, setCommentText] = useState("");
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };

  const [updateComment] = useMutation(UPDATE_COMMENT_MUTATION, {
    onCompleted: (data) => {
      if (data.updateComment.success) {
        onSetMessage({
          isError: false,
          text: "Comment successfully updated",
        });
        onCloseTile();
        onProfileUpdate();
      }
    },
    onError: (err) => {
      onSetMessage({
        isError: true,
        text: err.message,
      });
    },
  });
  const handleEditComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!commentText) {
      onSetMessage({
        isError: true,
        text: "Comment cannot be empty",
      });
      return;
    }
    updateComment({
      variables: {
        commentId: +comment.id,
        text: commentText,
      },
    });
  };

  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    onCompleted: (data) => {
      if (data.deleteComment.success) {
        onSetMessage({
          tileId: NaN,
          tileType: null,
          isError: false,
          text: "",
        });
        setIsDeleteCardOpen(false);
        onProfileUpdate();
        onCommentClick(null);
      }
    },
    onError: (err) => {
      onSetMessage({
        tileId: index,
        tileType: "comment",
        isError: true,
        text: err.message,
      });
    },
  });
  const handleDeleteComment = (id: number) => {
    deleteComment({ variables: { commentId: +id } });
    onCloseTile();
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
              <button
                className={`p-3 rounded-full shadow-lg transition-colors duration-200 ${comment.isBanned ? "hover:bg-red-400" : "hover:bg-gray-500"}`}
              >
                <PlayIcon />
              </button> 
              <EditIcon onClick={onEdit} styleClass={comment.isBanned && "text-red-800 hover:text-gray-800"} />
              <DeleteIcon onClick={handleDeleteClick} styleClass={comment.isBanned && "text-red-800 hover:text-gray-800"} />
            </div>
          )}
      </li>
      {message && <p className={`mb-4 mt-1 text-sm text-center ${message.isError ? "text-red-500" : "text-green-500"}`}>{message.text}</p>}
      {isDeleteCardOpen && (
        <DeleteContentCard
          title={comment.text}
          onDeleteContent={() => { handleDeleteComment(comment.id) }}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
};

export default ProfileCommentTile;
