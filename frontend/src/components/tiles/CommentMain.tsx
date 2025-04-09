import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import COMMENT_QUERY from "../../graphql/commentQuery.ts";
import CREATE_COMMENT_MUTATION from "../../graphql/createCommentMutation.ts";
import CommentTile from "./CommentTile.tsx";

interface CommentMainProps {
  publicationId: number;
  onError: () => void;
}

const CommentMain = ({ publicationId, onError }: CommentMainProps) => {
  const [enabledCommentZone, setEnabledCommentZone] = useState(null);
  const [commentText, setCommentText] = useState("");
  const { loading, error, data } = useQuery(COMMENT_QUERY, {
    variables: { publicationId: +publicationId },
  });

  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: COMMENT_QUERY, variables: { publicationId: +publicationId } }],
    onError: (err) => {
      onError(err.message);
    },
  });

  const comments = data?.commentsByPublication || [];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  const buildCommentTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, children: [] };
    });

    comments.forEach((comment) => {
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
    return comments.map((comment) => (
      <div key={comment.id}>
        <CommentTile 
          comment={comment} 
          level={level} 
          onReply={(replyText) => handleReply(comment.id, replyText)}
          onEnableCommentZone={setEnabledCommentZone}
          enableCommentZone={enabledCommentZone === comment.id}
        />
        {comment.children.length > 0 && renderComments(comment.children, level + 1)}
      </div>
    ));
  };

  const commentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      await createComment({
        variables: {
          publication: +publicationId,
          text: commentText,
        },
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleReply = async (parentId, replyText) => {
    if (!replyText.trim()) return;
  
    try {
      await createComment({
        variables: {
          publication: +publicationId,
          text: replyText,
          parent: +parentId,
        },
      });
    } catch (err) {
      console.error("Failed to post reply:", err.message);
      // Affichez un message d'erreur à l'utilisateur si nécessaire
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-black mb-4">Comments</h3>
      <textarea
        className="mt-2 mb-2 h-8 w-full bg-gray-100 border-b-solid border-b-black border-b-2"
        placeholder="your comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <button
        className="mb-2 rounded-md pl-2 pr-2 pt-1 pb-1 text-gray-800 hover:text-white hover:bg-gray-800"
        onClick={commentSubmit}
      >
        comment
      </button>
      {commentTree.length > 0 ? (
        renderComments(commentTree)) : (
        <p className="text-gray-600 text-sm">No comments yet.</p>
      )}
    </div>
  );
};

export default CommentMain;
