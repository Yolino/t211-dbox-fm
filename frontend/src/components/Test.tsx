import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_TEST_COUNT = gql`
  query {
    publications {
      title
    }
  }
`;

const Test = () => {
  const { loading, error, data } = useQuery(GET_TEST_COUNT);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return <p>GraphQL output : {data?.testCount}</p>;
}

export default Test;
