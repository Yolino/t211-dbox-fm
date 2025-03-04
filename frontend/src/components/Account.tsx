import React, { useState } from "react";
import LoginCard from "./LoginCard.tsx";
import SignupCard from "./SignupCard.tsx";

const Account = () => {
  const [isLoginCardOpen, setIsLoginCardOpen] = useState(false);
  const [isSignupCardOpen, setIsSignupCardOpen] = useState(false);

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
  return (
    <div className="LogButtons">
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
      {isLoginCardOpen && <LoginCard onClose={handleCloseLoginCard} />} {/* Affiche la carte de connexion */}
      {isSignupCardOpen && <SignupCard onClose={handleCloseSignupCard} />} {/* Affiche la carte d'inscription */}
    </div>
  );
};

export default Account;
