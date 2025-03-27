import { gql } from "@apollo/client";

const LOGOUT_MUTATION = gql`
  mutation LogoutUser {
    logoutUser {
      user {
        id
        username
        email
      }
    }
  }
`;

export default LOGOUT_MUTATION;
