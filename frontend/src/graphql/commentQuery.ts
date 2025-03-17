import { gql } from "@apollo/client";

const COMMENT_QUERY = gql`
  query CommentQuery($publicationId: Int!) {
    commentsByPublication(publicationId: $publicationId) {
        id
        text
        author {username}
        parent {id}
        createdAt
    }
  }
`;

export default COMMENT_QUERY;
