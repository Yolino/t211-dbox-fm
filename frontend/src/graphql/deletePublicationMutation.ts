import { gql } from "@apollo/client";

const DELETE_PUBLICATION_MUTATION = gql`
  mutation DeletePublication($publicationId: Int!) {
    deletePublication(publicationId: $publicationId) {
      success
    }
  }
`;

export default DELETE_PUBLICATION_MUTATION;
