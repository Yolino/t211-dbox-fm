import { gql } from "@apollo/client";

const PUBLICATION_DETAIL_QUERY = gql`
  query PublicationsDetailQuery($publicationId: Int!) {
    publication(id: $publicationId) {
      title
      author {
        id
        username
        isActive
      }
      cover
      tag {
        name
      }
      description
      viewCount
      voteCount
      createdAt
      isBanned
      isOwner
    }
  }
`;

export default PUBLICATION_DETAIL_QUERY;
