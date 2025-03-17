import React from "react";
import { useQuery } from "@apollo/client";
import PUBLICATION_DETAIL_QUERY from "../graphql/publicationDetailQuery.ts";
import COMMENT_QUERY from "../graphql/commentQuery.ts";

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
}

const TileExpanded = ({ tileId }) => {
  const { loading: publicationLoading, error: publicationError, data: publicationData } = useQuery(PUBLICATION_DETAIL_QUERY, {
    variables: { publicationId: +tileId },
  });

  const { loading: commentLoading, error: commentError, data: commentData } = useQuery(COMMENT_QUERY, {
    variables: { publicationId: +tileId },
  });

  const publication = publicationData?.publication || {};
  const comments = commentData?.commentsByPublication || [];

  if (publicationLoading || commentLoading) return <p>Loading...</p>;
  if (publicationError || commentError) return <p>Error</p>;

  // Function to build the comment tree
  const buildCommentTree = (comments: Comment[]) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, children: [] };
    });

    comments.forEach(comment => {
      if (comment.parent && commentMap[comment.parent.id]) {
        commentMap[comment.parent.id].children.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);

  // Recursive function to render comments
  const renderComments = (comments, level = 0) => {
    return comments.map(comment => (
      <div key={comment.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center justify-between">
          <p className="text-gray-700 font-medium">{comment.author.username}</p>
          <p className="text-gray-400 text-xs">{comment.createdAt}</p>
        </div>
        <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
        {comment.children.length > 0 && renderComments(comment.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md mt-4 animate-fade-in">
      <div className="flex gap-4">
        {/* Cover Image */}
        <img
          className="w-32 h-32 object-cover rounded-lg shadow-md"
          src={`http://localhost:8000${publication.cover}`}
          alt={`Cover for ${publication.title}`}
        />

        {/* Text Content */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">{publication.title}</h2>
            <button className="text-gray-600 hover:text-black transition-colors"></button>
          </div>
          <p className="text-gray-700">by {publication.author.username} on {publication.createdAt}</p>
          <p className="text-gray-600 text-sm mt-2">{publication.description || "No description available."}</p>
          <p className="text-gray-400 text-xs mt-2">{publication.viewCount} views</p>
          <p className="text-gray-400 text-xs mt-2">{publication.voteCount} votes</p>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-black mb-4">Comments</h3>
        {commentTree.length > 0 ? (
          renderComments(commentTree)
        ) : (
          <p className="text-gray-600 text-sm">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default TileExpanded;