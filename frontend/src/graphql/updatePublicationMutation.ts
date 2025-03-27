import { gql } from "@apollo/client";

const UPDATE_PUBLICATION_MUTATION = gql`
  mutation UpdatePublication($publicationId: Int!, $title: String, $cover: Upload, $tag: Int, $description: String) {
    updatePublication(publicationId: $publicationId, title: $title, cover: $cover, tag: $tag, description: $description) {
      success
    }
  }
`;

export default UPDATE_PUBLICATION_MUTATION;
