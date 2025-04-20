import { gql } from "@apollo/client";

const UNBAN_CONTENT_MUTATION = gql`
  mutation UnbanContent($bannedId: Int!, $contentType: String!) {
    unbanContent(bannedId: $bannedId, contentType: $contentType) {
      success
    }
  }
`;

export default UNBAN_CONTENT_MUTATION;
