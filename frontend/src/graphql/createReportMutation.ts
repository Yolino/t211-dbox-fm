import { gql } from "@apollo/client";

const CREATE_REPORT_MUTATION = gql`
  mutation CreateReport($reportedId: Int!, $contentType: String!) {
    createReport(reportedId: $reportedId, contentType: $contentType) {
      success
    }
  }
`;

export default CREATE_REPORT_MUTATION;
