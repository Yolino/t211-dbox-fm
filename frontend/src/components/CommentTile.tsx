import { React, useState } from "react";

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

  const [isVisible, setIsVisible] = useState(false);

  return (
    <div key={comment.id} style={{ marginLeft: `${(level * 20) + 22}px` }}>
      <div className="flex items-center justify-between">
        <p className="text-gray-700 font-medium">{comment.author.username}</p>
        <p className="text-gray-400 text-xs">{comment.createdAt}</p>
      </div>
      <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
      <div className="flex">
        <button onClick={() => setIsVisible(!isVisible)} className="h-7 text-xs text-gray-400 pl-2 pr-2 pt-1 pb-1 ml-5 mb-6 mt-1 rounded-md hover:text-white hover:bg-gray-800">reply</button>
        <div style={{ display: isVisible ? "block" : "none" }} className="w-1/3">
      	  <textarea
	    className="m-2 border-b-solid border-b-black border-b-2 bg-gray-100 h-7"
	    placeholder="your reply..." 
	  />
	  <button 
	    className="text-xs pl-2 pr-2 pt-1 pb-1 rounded-md text-white bg-gray-800">
	    reply to comment
	  </button>
	</div>
      </div>
    </div>
  );
}

export default CommentTile;
