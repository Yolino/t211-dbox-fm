import { gql } from "@apollo/client";

const PUBLICATIONS_QUERY = gql`
  query PublicationsQuery($count: Int!, $orderBy: String!) {
    publications(count: $count, orderBy: $orderBy) {
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
