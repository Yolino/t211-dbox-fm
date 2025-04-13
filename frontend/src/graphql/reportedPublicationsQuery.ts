import { gql } from "@apollo/client";

const REPORTED_PUBLICATIONS_QUERY = gql`
  query ReportedPublications {
    reportedPublications {
      id
      title
      description
    }
  }
`;

export default REPORTED_PUBLICATIONS_QUERY;
