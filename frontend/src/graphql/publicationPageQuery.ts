import { gql } from "@apollo/client";

const PUBLICATION_PAGE_QUERY = gql`
  query PublicationPage($start: Int, $count: Int, $orderBy: String!) {
    publicationPage(start: $start, count: $count, orderBy: $orderBy) {
      publications {
        id
        title
        cover
        voteCount
        author {
          username
        }
        visitorVote
      }
      hasNextPage
    }
  }
`;

export default PUBLICATION_PAGE_QUERY;
