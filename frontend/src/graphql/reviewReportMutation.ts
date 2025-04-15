import { gql } from "@apollo/client";

const REVIEW_REPORT_MUTATION = gql`
  mutation ReviewReport($reportId: Int!, $reportType: String!, $isSafe: Boolean!) {
    reviewReport(reportId: $reportId, reportType: $reportType, isSafe: $isSafe) {
      success
    }
  }
`;

export default REVIEW_REPORT_MUTATION;
