import React, { useState } from "react";
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import LoginCard from "./LoginCard.tsx";
import SignupCard from "./SignupCard.tsx";
import Profile from "./Profile.tsx";

const Account = ({ onSwitchPage }) => {
  const { privileges, refreshPrivileges } = usePrivileges();
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

  const handleLoginSuccess = async () => {
    await refreshPrivileges();
  };

  const handleSignupSuccess = async () => {
    await refreshPrivileges();
  };

  return (
    <div className="LogButtons">
      {privileges?.isLoggedIn ? ( // Si l'utilisateur est connecté
        <Profile onSwitchPage={onSwitchPage} />
      ) : ( // Si l'utilisateur n'est pas connecté
        <>
          <button
            id="logIn"
            className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded"
            onClick={handleLoginClick}
          >
            Log In
          </button>
          <button
            id="signIn"
            className="bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded ml-5 mr-2"
            onClick={handleSignupClick}
          >
            Sign Up
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
