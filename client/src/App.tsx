import "./App.css";
import { Outlet } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import Navbar from "./components/Navbar";

// create http link for GraphQL
const httpLink = createHttpLink({
  uri: "/graphql", // GQL endpoint
});

// auth link for JWT token to request headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");

  // return headers to the context
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// create the Apollo Client instance with combined link & cache
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// wrap App with ApolloProvider
function App() {
  return (
    <ApolloProvider client={client}> 
      <>
        <Navbar />
        <Outlet />
      </>
    </ApolloProvider>
  );
}

export default App;
