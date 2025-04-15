import { gql } from "@apollo/client";

const REVIEW_REPORT_MUTATION = gql`
  mutation ReviewReport($reportedId: Int!, $reportType: String!, $isSafe: Boolean!) {
    reviewReport(reportedId: $reportedId, reportType: $reportType, isSafe: $isSafe) {
      success
    }
  }
`;

export default REVIEW_REPORT_MUTATION;
