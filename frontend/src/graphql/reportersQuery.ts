import { gql } from "@apollo/client";

const REPORTERS_QUERY = gql`
  query Reporters($reportedId: Int!, $contentType: String!) {
    reporters(reportedId: $reportedId, contentType: $contentType) {
      __typename
      ... on ReportPublicationType {
        id
        reporter {
        username
        }
      }
      ... on ReportUserType {
        id
        reporter {
          username
        }
      }
      ... on ReportCommentType {
        id
        reporter {
          username
        }
      }
    }
  }
`;

export default REPORTERS_QUERY;
