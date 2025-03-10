import { gql } from "@apollo/client";

const PUBLICATIONS_QUERY = gql`
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

export default PUBLICATIONS_QUERY;
