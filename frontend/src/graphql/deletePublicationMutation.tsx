import { gql } from "@apollo/client";

const DELETE_PUBLICATION_MUTATION = gql`
  mutation DeletePublicationMutation($publicationId: Int!) {
    deletePublication(publicationId: $publicationId) {
      success
    }
  }
`;

export default DELETE_PUBLICATION_MUTATION;
