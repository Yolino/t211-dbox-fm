import { gql } from "@apollo/client";

const USER_REPORTS_QUERY = gql`
  query UserReports($reportedId: Int!) {
    userReports(reportedId: $reportedId) {
      id
      reporter {
        username
      }
    }
  }
`;

export default USER_REPORTS_QUERY;
