import { gql } from "@apollo/client";

const CREATE_REPORT_PUBLICATION_MUTATION = gql`
  mutation CreateReportPublication($reportedId: Int!) {
    createReportPublication(reportedId: $reportedId) {
      success
    }
  }
`;

export default CREATE_REPORT_PUBLICATION_MUTATION;
