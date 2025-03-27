import { gql } from "@apollo/client";

const CREATE_SCHEDULING_MUTATION = gql`
  mutation CreateSchedulingMutation($publicationId: Int!, $time: DateTime!) {
    createScheduling(publicationId: $publicationId, time: $time) {
      scheduling {
        publication {
          author {
            username
          }
          title
        }
        time
      }
    }
  }
`;

export default CREATE_SCHEDULING_MUTATION;
