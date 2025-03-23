import { gql } from "@apollo/client";

const DELETE_SCHEDULING_MUTATION = gql`
  mutation DeleteScheduling($schedulingId: Int!) {
    deleteScheduling(schedulingId: $schedulingId) {
      success
    }
  }
`;

export default DELETE_SCHEDULING_MUTATION;
