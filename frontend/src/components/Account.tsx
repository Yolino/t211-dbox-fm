import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import LoginCard from "./LoginCard.tsx";
import SignupCard from "./SignupCard.tsx";
import Profile from "./Profile.tsx";

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

const Account = () => {
  const [isLoginCardOpen, setIsLoginCardOpen] = useState(false);
  const [isSignupCardOpen, setIsSignupCardOpen] = useState(false);

  // Exécuter la requête `me` pour vérifier l'authentification
  const { loading, error, data, refetch } = useQuery(ME_QUERY, {
    onError: (error) => {
      console.error("Erreur :", error.message);
    },
  });

  const handleLoginClick = () => {
    setIsLoginCardOpen(true);
  };

  const handleCloseLoginCard = () => {
    setIsLoginCardOpen(false);
  };

  const handleSignupClick = () => {
    setIsSignupCardOpen(true);
  };

  const handleCloseSignupCard = () => {
    setIsSignupCardOpen(false);
  };

  const handleLoginSuccess = () => {
    refetch(); // Rafraîchir les données après une connexion réussie
  };

  const handleSignupSuccess = () => {
    refetch(); // Rafraîchir les données après une inscription réussie
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="LogButtons">
      {data?.me ? ( // Si l'utilisateur est connecté
        <Profile />
      ) : ( // Si l'utilisateur n'est pas connecté
        <>
          <button
            id="logIn"
            className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded"
            onClick={handleLoginClick}
          >
            Se connecter
          </button>
          <button
            id="signIn"
            className="bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded ml-5 mr-2"
            onClick={handleSignupClick}
          >
            S'inscrire
          </button>
        </>
      )}

      {isLoginCardOpen && (
        <LoginCard onClose={handleCloseLoginCard} onLoginSuccess={handleLoginSuccess} />
      )}

      {isSignupCardOpen && (
        <SignupCard onClose={handleCloseSignupCard} onSignupSuccess={handleSignupSuccess} />
      )}
    </div>
  );
};

export default Account;