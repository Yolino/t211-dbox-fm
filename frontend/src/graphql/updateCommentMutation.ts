import { gql } from "@apollo/client";

const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($commentId: Int!, $text: String!) {
    updateComment(commentId: $commentId, text: $text) {
      success
    }
  }
`;

export default UPDATE_COMMENT_MUTATION;
