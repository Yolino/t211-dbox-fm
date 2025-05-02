import { gql } from "@apollo/client";

const PROFILE_QUERY = gql`
  query ProfileQuery($username: String) {
    profile(username: $username) {
      user {
        username
        email
        isActive
      }
      publications {
        id
        title
        description
        cover
        tag {
          id
        }
        viewCount
        voteCount
        isBanned
      }
      comments {
        id
        text
        publication {
          id
        }
        isBanned
      }
      isSelf
    }
  }
`;

export default PROFILE_QUERY;
