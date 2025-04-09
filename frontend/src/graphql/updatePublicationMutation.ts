import { gql } from "@apollo/client";

const UPDATE_PUBLICATION_MUTATION = gql`
  mutation UpdatePublication($publicationId: Int!, $title: String, $cover: Upload, $removeCover: Boolean!, $tag: Int, $description: String) {
    updatePublication(publicationId: $publicationId, title: $title, cover: $cover, removeCover: $removeCover, tag: $tag, description: $description) {
      success
    }
  }
`;

export default UPDATE_PUBLICATION_MUTATION;
