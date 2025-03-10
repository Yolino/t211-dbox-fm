import { gql } from "@apollo/client";

export const PUBLICATIONS_QUERY = gql`
  query PublicationsQuery($orderBy: String!) {
    publications(orderBy: $orderBy) {
      id
      title
      cover
      voteCount
      author {
        username
      }
    }
  }
`;
