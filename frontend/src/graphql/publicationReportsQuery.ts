import { gql } from "@apollo/client";

const PUBLICATION_REPORTS_QUERY = gql`
  query PublicationReports($reportedId: Int!) {
    publicationReports(reportedId: $reportedId) {
      id
      reporter {
        username
      }
    }
  }
`;

export default PUBLICATION_REPORTS_QUERY;
