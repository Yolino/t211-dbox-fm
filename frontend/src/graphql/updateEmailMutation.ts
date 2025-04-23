import { gql } from '@apollo/client';

const UPDATE_EMAIL_MUTATION = gql`
	mutation UpdateEmail($newEmail: String!, $password: String!) {
		updateEmail(newEmail: $newEmail, password: $password) {
			success
		}
	}
`;

export default UPDATE_EMAIL_MUTATION;
