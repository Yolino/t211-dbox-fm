import { gql } from "@apollo/client";

const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($publication: Int!, $text: String!, $parent: Int) {
    createComment(publication: $publication, text: $text, parent: $parent) {
      comment {
        id
        text
        author {
          username
        }
        publication {
          title
        }
        parent {
          id
          text
        }
      }
    }
  }
`;

export default CREATE_COMMENT_MUTATION;