import { gql } from "@apollo/client";

const CREATE_VIEW_MUTATION = gql`
  mutation CreateViewMutation($publicationId: Int!)  {
    createView(publicationId: $publicationId) {
      viewCount
    }
  }
`;

export default CREATE_VIEW_MUTATION;
