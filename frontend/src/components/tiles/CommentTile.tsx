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
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleReplySubmit();
    }
  };

  const date = new Date(comment.createdAt);
  const formattedDateComment = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

  return (
    <div key={comment.id} style={{ marginLeft: `${(level * 20) + 22}px` }} className={`${comment.isBanned ? "bg-red-200 text-red-800" : "text-gray-800"} rounded-md p-1 m-1`}>
      <div className="flex items-center justify-between">
        <p className="font-medium"><span className="cursor-pointer" onClick={() => { navigate(`/profile/${comment.author.username}`); }}>{comment.author.username}</span></p>
        <p className="text-xs">{formattedDateComment}</p>
      </div>
      <p className="text-sm mt-1">{comment.text}</p>
      <div className="flex items-center">
        {!comment.isBanned && <div>
          <button 
            onClick={() => { onEnableCommentZone(comment.id) }}
            className="text-xs px-2 py-1 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200"
          >
            Reply
          </button>
          <button
            onClick={onReportComment}
            className="ml-2 text-xs px-2 py-1 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition" 
          >
            Report comment
          </button>
        </div>}
        {enableCommentZone && 
          <div className="flex w-1/3">
            <textarea
              className="m-2 border-b-solid border-b-black border-b-2 bg-gray-100 h-7"
              placeholder="Write reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="px-2 bg-blue-500 text-sm text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200"
              onClick={handleReplySubmit}
            >
              Submit
            </button>
          </div>
        }
      </div>
    </div>
  );
}

export default CommentTile;
