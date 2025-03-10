import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      success
      user {
        id
        username
        email
      }
    }
  }
`;
