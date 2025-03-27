import { gql } from "@apollo/client";

const UPDATE_USERNAME_MUTATION = gql`
  mutation UpdateUsername($newUsername: String!, $password: String!) {
    updateUsername(newUsername: $newUsername, password: $password) {
      success
    }
  }
`;

export default UPDATE_USERNAME_MUTATION;
