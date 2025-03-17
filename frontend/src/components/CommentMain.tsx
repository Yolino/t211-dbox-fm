import React from "react";
import { useQuery } from "@apollo/client";
import COMMENT_QUERY from "../graphql/commentQuery.ts";
import CommentTile from "./CommentTile.tsx";

const CommentMain = ({publicationId}) => {
  const { loading, error, data } = useQuery(COMMENT_QUERY, {
    variables: { publicationId: +publicationId },
  });
  const comments = data?.commentsByPublication || [];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

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

  const renderComments = (comments, level = -1) => {
    return comments.map(comment => (
      <>
        <CommentTile comment={comment} level={level} />
        {comment.children.length > 0 && renderComments(comment.children, level + 1)}
      </>
    ));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-black mb-4">Comments</h3>
      {commentTree.length > 0 ? (renderComments(commentTree)) : (
        <p className="text-gray-600 text-sm">No comments yet.</p>
      )}
    </div>
  );
};

export default CommentMain;



