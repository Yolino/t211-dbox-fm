import { gql } from "@apollo/client";

const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: Int!) {
    deleteComment(commentId: $commentId) {
      success
    }
  }
`;

export default DELETE_COMMENT_MUTATION;
