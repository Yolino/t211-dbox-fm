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
    <div key={comment.id} style={{ marginLeft: `${level * 20}px` }}>
      <div className="flex items-center justify-between">
        <p className="text-gray-700 font-medium">{comment.author.username}</p>
        <p className="text-gray-400 text-xs">{comment.createdAt}</p>
      </div>
      <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
    </div>
  );
}

export default CommentTile;
