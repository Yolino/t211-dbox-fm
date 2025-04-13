import { gql } from "@apollo/client";

const REVIEW_REPORT_USER_MUTATION = gql`
  mutation ReviewReportUser($reportUserId: Int!) {
    reviewReportUser(reportUserId: $reportUserId) {
      success
    }
  }
`;

export default REVIEW_REPORT_USER_MUTATION;
