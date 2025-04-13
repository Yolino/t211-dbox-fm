import { gql } from "@apollo/client";

const CREATE_REPORT_USER_MUTATION = gql`
  mutation CreateReportUser($reportedId: Int!) {
    createReportUser(reportedId: $reportedId) {
      success
    }
  }
`;

export default CREATE_REPORT_USER_MUTATION;
