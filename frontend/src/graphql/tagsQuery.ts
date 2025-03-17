import { gql } from "@apollo/client";

const TAGS_QUERY = gql`
query {
  tags {
    id
    name
  }
}
`;

export default TAGS_QUERY;