import { gql } from "@apollo/client";

const REVIEW_REPORT_COMMENT_MUTATION = gql`
  mutation ReviewReportComment($reportCommentId: Int!) {
    reviewReportComment(reportCommentId: $reportCommentId) {
      success
    }
  }
`;

export default REVIEW_REPORT_COMMENT_MUTATION;
