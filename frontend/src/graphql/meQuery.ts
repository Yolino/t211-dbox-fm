import { gql } from "@apollo/client";

const ME_QUERY = gql`
  query Me {
    me {
      isLoggedIn
      isModerator
    }
  }
`;

export default ME_QUERY;
