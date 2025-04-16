import React, { useState } from "react";

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
  onReply: (replyText: string) => void;
  enableCommentZone: boolean;
  onReportComment: () => void;
};

const CommentTile = ({ comment, level, onReply, onEnableCommentZone, enableCommentZone, onReportComment }: CommentProps) => {
  const [replyText, setReplyText] = useState("");
  const handleReplySubmit = () => {
    onReply(replyText);
    setReplyText("");
    onEnableCommentZone(null);
  }; 
  const date = new Date(comment.createdAt);
  const formattedDateComment = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

  return (
    <div key={comment.id} style={{ marginLeft: `${(level * 20) + 22}px` }}>
      <div className="flex items-center justify-between">
        <p className="text-gray-700 font-medium">{comment.author.username}</p>
        <p className="text-gray-400 text-xs">{formattedDateComment}</p>
      </div>
      <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
      <div className="flex">
        <button 
          onClick={() => { onEnableCommentZone(comment.id) }}
          className="text-xs text-gray-400 px-2 py-1 ml-5 mb-6 mt-1 rounded-md hover:text-white hover:bg-gray-800"
        >
          Reply
        </button>
        <button
          onClick={onReportComment}
          className="text-xs text-gray-400 px-2 py-1 ml-5 mb-6 mt-1 rounded-md hover:text-red-800 hover:bg-red-100" 
        >
          Report comment
        </button>
        {enableCommentZone && 
          <div className="w-1/3">
            <textarea
              className="m-2 border-b-solid border-b-black border-b-2 bg-gray-100 h-7"
              placeholder="your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button 
              className="text-xs px-2 py-1 rounded-md text-white bg-gray-800"
              onClick={handleReplySubmit}
            >
              Reply
            </button>
          </div>
        }
      </div>
    </div>
  );
}

export default CommentTile;
