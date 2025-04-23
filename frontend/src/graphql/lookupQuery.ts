import { gql } from "@apollo/client";

const LOOKUP_QUERY = gql`
  query Lookup($text: String!) {
    publicationLookup(title: $text) {
      id
      title
      author {
        username
      }
      isBanned
    }
    userLookup(name: $text) {
      id
      username
      isActive
    }
  }
`;

export default LOOKUP_QUERY;
