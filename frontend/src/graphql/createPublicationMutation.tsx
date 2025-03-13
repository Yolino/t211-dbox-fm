import { gql } from "@apollo/client";

const CREATE_PUBLICATION_MUTATION = gql`
  mutation CreatePublication($title: String!, $cover: Upload, $tag: Int!, $description: String!, $audio: Upload!) {
    createPublication(title: $title, cover: $cover, tag: $tag, description: $description, audio: $audio) {
      publication {
        id
      }
    }
  }
`;

export default CREATE_PUBLICATION_MUTATION;
