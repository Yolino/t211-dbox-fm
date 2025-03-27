import { gql } from "@apollo/client";

const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePasswordMutation($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $currentPassword) {
      success
    }
  }
`;

export default UPDATE_PASSWORD_MUTATION;
