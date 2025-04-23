import { gql } from "@apollo/client";

const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
    }
  }
`;

export default UPDATE_PASSWORD_MUTATION;
