import React from "react";

interface Comment {
  id: number;
  text: string;
  author: {
    username: string;
  };
  parent: {
    id: number;
  } | null;
  createdAt: string;
};

interface CommentProps {
  comment: Comment;
  level: number;
};

const CommentTile = ({comment, level}: CommentProps) => {
  return (
    <div key={comment.id} style={{ marginLeft: `${(level * 20) + 22}px` }}>
      <div className="flex items-center justify-between">
        <p className="text-gray-700 font-medium">{comment.author.username}</p>
        <p className="text-gray-400 text-xs">{comment.createdAt}</p>
      </div>
      <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
      <button className="text-xs text-gray-400 pl-2 pr-2 pt-1 pb-1 ml-5 mb-6 mt-1 rounded-md hover:text-white hover:bg-gray-800">reply</button>
    </div>
  );
}

export default CommentTile;
