import { gql } from "@apollo/client";

const CREATE_SCHEDULING_MUTATION = gql`
  mutation CreateSchedulingMutation($publicationId: Int!, $time: DateTime!) {
    
  }
`;

export default CREATE_SCHEDULING_MUTATION;
