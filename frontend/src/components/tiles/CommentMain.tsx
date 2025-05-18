import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import COMMENT_QUERY from "../../graphql/commentQuery.ts";
import CREATE_COMMENT_MUTATION from "../../graphql/createCommentMutation.ts";
import CommentTile from "./CommentTile.tsx";

interface CommentMainProps {
  publicationId: number;
  onSubmit: (message: string) => void;
  onError: (message: string) => void;
  onReportComment: () => void;
}

const CommentMain = ({ publicationId, onSubmit, onError, onReportComment }: CommentMainProps) => {
  const { privileges } = usePrivileges();
  const [enabledCommentZone, setEnabledCommentZone] = useState(null);
  const [commentText, setCommentText] = useState("");
  const { loading, error, data } = useQuery(COMMENT_QUERY, {
    variables: { publicationId: +publicationId },
  });

  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: COMMENT_QUERY, variables: { publicationId: +publicationId } }],
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
      <div key={comment.id} className="overflow-y-auto">
        <CommentTile 
          comment={comment} 
          level={level} 
          onReply={(replyText) => handleReply(comment.id, replyText)}
          onEnableCommentZone={setEnabledCommentZone}
          enableCommentZone={enabledCommentZone === comment.id}
          onReportComment={() => { onReportComment(comment.id) }}
        />
        {comment.children.length > 0 && renderComments(comment.children, level + 1)}
      </div>
    ));
  };

  const commentSubmit = async () => {
    if (!privileges?.isLoggedIn) {
      onError("You must be logged in to submit comments");
      return;
    }
    if (!commentText.trim()) {
      onError("You cannot submit empty comments");
      return;
    }
    await createComment({
      variables: {
        publication: +publicationId,
        text: commentText,
      },
      onCompleted: (data) => {
        if (data.createComment.success) {
          onSubmit("Comment submitted successfully");
          setCommentText("");
        }
      },
      onError: (err) => {
        onError(err.message);
      },
    });
  };

  const handleReply = async (parentId, replyText) => {
    if (!privileges?.isLoggedIn) {
      onError("You must be logged in to submit comments");
      return;
    }

    if (!replyText.trim()) {
      onError("You cannot submit empty comments");
      return;
    }
    await createComment({
      variables: {
        publication: +publicationId,
        text: replyText,
        parent: +parentId,
      },
      onCompleted: (data) => {
        onSubmit("Comment submitted successfully");
      },
      onError: (err) => {
        onError(err.message);
      },
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commentSubmit();
    }
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-black mb-4">Comments</h3>
      <div className="flex gap-1 mb-2">
        <textarea
          className="mt-2 mb-2 h-8 w-full bg-gray-100 border-b-solid border-b-black border-b-2"
          placeholder="Write comment"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-2 py-1 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-200"
          onClick={commentSubmit}
        >
          Comment
        </button>
      </div>
      <div className="max-h-[calc(15vh)] lg:max-h-[calc(25vh)] overflow-y-auto">
        {commentTree.length > 0 ? (
          renderComments(commentTree)) : (
          <p className="text-gray-600 text-sm">No comments yet.</p>
        )}
      </div>
    </>
  );
};

export default CommentMain;
