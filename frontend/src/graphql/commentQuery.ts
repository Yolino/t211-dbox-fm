import { gql } from "@apollo/client";

const COMMENT_QUERY = gql`
  query CommentQuery($publicationId: Int!) {
    commentsByPublication(publicationId: $publicationId) {
        id
        text
        author {
          username
          isActive
        }
        parent {
          id
          isBanned
        }
        createdAt
        isBanned
    }
  }
`;

export default COMMENT_QUERY;
