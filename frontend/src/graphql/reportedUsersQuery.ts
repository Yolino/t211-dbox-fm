import { gql } from "@apollo/client";

const REPORTED_USERS_QUERY = gql`
  query ReportedUsers {
    reportedUsers {
      id
      username
    }
  }
`;

export default REPORTED_USERS_QUERY;
