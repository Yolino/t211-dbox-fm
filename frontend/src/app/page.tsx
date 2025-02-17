"use client";

import { useQuery, gql } from "@apollo/client";

const GET_TEST_COUNT = gql`
  query GetTestCount {
    testCount
  }
`;

type GetTestCountData = {
  testCount: number;
};

export default function Home() {
  const { loading, error, data } = useQuery<GetTestCountData>(GET_TEST_COUNT);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      <h1>Hello world !</h1>
      <p>The GraphQL test output is : {data?.testCount}</p>
    </div>
  );
}
