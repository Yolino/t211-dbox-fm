import { gql } from "@apollo/client";

const COMMENT_REPORTS_QUERY = gql`
  query CommentReports($reportedId: Int!) {
    commentReports(reportedId: $reportedId) {
      id
      reporter {
        username
      }
    }
  }
`;

export default COMMENT_REPORTS_QUERY;
