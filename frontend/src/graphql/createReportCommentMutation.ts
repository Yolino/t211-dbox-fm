import { gql } from "@apollo/client";

const CREATE_REPORT_COMMENT_MUTATION = gql`
  mutation CreateReportComment($reportedId: Int!) {
    createReportComment(reportedId: $reportedId) {
      success
    }
  }
`;

export default CREATE_REPORT_COMMENT_MUTATION;
