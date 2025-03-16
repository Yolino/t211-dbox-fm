import { gql } from "@apollo/client";

const SCHEDULE_QUERY = gql`
  query ScheduleQuery($date: Date) {
    schedule(date: $date) {
      publication {
        title
        author {
          username
        }
        cover
      }
      time
    }
  }
`;

export default SCHEDULE_QUERY;
