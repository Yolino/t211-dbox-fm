import { gql } from "@apollo/client";

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($publication: Int!, $text: String!, $parent: Int) {
    createComment(publication: $publication, text: $text, parent: $parent) {
      success
    }
  }
`;

export default CREATE_COMMENT_MUTATION;
