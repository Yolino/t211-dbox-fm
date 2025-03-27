import { ApolloClient, InMemoryCache } from '@apollo/client';
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const link = createUploadLink({
  uri: "/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  fetchOptions: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export default client;
