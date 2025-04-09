import { gql } from "@apollo/client";

const DELETE_VOTE_MUTATION = gql`
  mutation DeleteVote($publicationId: Int!) {
    deleteVote(publicationId: $publicationId) {
      voteCount
    }
  }
`;

export default DELETE_VOTE_MUTATION;
