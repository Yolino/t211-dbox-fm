import { gql } from "@apollo/client";

const REPORTED_CONTENT_QUERY = gql`
  query ReportedContent {
    users {
      id
      username
    }
    publications {
      id
      title
      description
    }
    comments {
      id
      text
    }
  }
`;

export default REPORTED_CONTENT_QUERY;
