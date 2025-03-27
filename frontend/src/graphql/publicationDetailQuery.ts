import { gql } from "@apollo/client";

const PUBLICATION_DETAIL_QUERY = gql`
  query PublicationsDetailQuery($publicationId: Int!) {
    publication(id: $publicationId) {
      title
      author {
        username
      }
      cover
      tag {
        name
      }
      description
      viewCount
      voteCount
      createdAt
    }
  }
`;

export default PUBLICATION_DETAIL_QUERY;
