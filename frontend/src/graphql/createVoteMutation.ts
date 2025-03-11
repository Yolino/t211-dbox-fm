import { gql } from "@apollo/client";

const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($publicationId: Int!, $voteType: Int!)  {
    createVote(publicationId: $publicationId, type: $voteType) {
      voteCount
    }
  }
`;

export default CREATE_VOTE_MUTATION;
