import { gql } from "@apollo/client";

const REVIEW_REPORT_PUBLICATION_MUTATION = gql`
  mutation ReviewReportPublication($reportPublicationId: Int!) {
    reviewReportPublication(reportPublicationId: $reportPublicationId) {
      success
    }
  }
`;

export default REVIEW_REPORT_PUBLICATION_MUTATION;
