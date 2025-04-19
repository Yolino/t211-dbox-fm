import { gql } from "@apollo/client";

const BANNED_CONTENT_QUERY = gql`
  query BannedContent {
    bannedContent {
      users {
        id
        username
      }
      publications {
        id
        title
        description
      }
      comments {
        id
        text
        publication {
          id
        }
      }
    }
  }
`;

export default BANNED_CONTENT_QUERY;
