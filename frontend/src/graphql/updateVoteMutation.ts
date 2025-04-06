import { gql } from "@apollo/client";

const UPDATE_VOTE_MUTATION = gql`
  mutation UpdateVote($publicationId: Int!, $voteType: Int!) {
    updateVote(publicationId: $publicationId, type: $voteType) {
      voteCount
    }
  }
`;

export default UPDATE_VOTE_MUTATION;
