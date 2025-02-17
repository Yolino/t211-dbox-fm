import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const createClient = () => {
  let csrfToken = "";
  
  if (typeof window !== "undefined") {
    csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || "";
  }

  return new ApolloClient({
    link: new HttpLink({
      uri: "http://localhost:8000/graphql/",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    }),
    cache: new InMemoryCache(),
  });
};

const client = createClient();
export default client;
