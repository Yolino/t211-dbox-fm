import { gql } from "@apollo/client";

const REPORTED_COUNT_QUERY = gql`
  query ReportedCount {
    reportedContent {
      totalCount
    }
  }
`;

export default REPORTED_COUNT_QUERY;
