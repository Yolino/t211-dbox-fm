import React from "react";
import { BrowserRouter } from "react-router-dom";
import { PrivilegesProvider } from "./context/PrivilegesContext.tsx";
import HomePage from "./pages/HomePage.tsx";

function App() {
  return (
    <PrivilegesProvider>
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    </PrivilegesProvider>
  );
}

export default App;
