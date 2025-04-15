import { gql } from "@apollo/client";

const REPORTED_CONTENT_QUERY = gql`
  query ReportedContent {
    reportedContent {
      users {
        id
        username
        reportCount
      }
      publications {
        id
        title
        description
        reportCount
      }
      comments {
        id
        text
        reportCount
      }
    }
  }
`;

export default REPORTED_CONTENT_QUERY;
