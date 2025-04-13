import { gql } from "@apollo/client";

const REPORTED_COMMENTS_QUERY = gql`
  query ReportedComments {
    reportedComments {
      id
      text
    }
  }
`;

export default REPORTED_COMMENTS_QUERY;
