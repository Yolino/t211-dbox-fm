import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://backend:8000/graphql/",
    headers: {
      "Content-Type": "application/json",
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
