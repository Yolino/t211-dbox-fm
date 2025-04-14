import React, { useState } from "react";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import LoginCard from "./LoginCard.tsx";
import SignupCard from "./SignupCard.tsx";
import HeaderProfile from "./HeaderProfile.tsx";

const HeaderAccount = ({ onSwitchPage }) => {
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
    <div className="w-full">
      {!privileges?.isLoggedIn && (
        <div className="flex flex-col sm:flex-row w-full gap-2">
          <button
            id="logIn"
            className="w-full px-6 py-3 whitespace-nowrap bg-white hover:bg-gray-200 text-black font-semibold rounded-lg shadow-lg focus:outline-none transition-all duration-300"
            onClick={handleLoginClick}
          >
            Log In
          </button>
          <button
            id="signIn"
            className="w-full px-6 py-3 whitespace-nowrap bg-black hover:bg-gray-900 text-white font-semibold rounded-lg shadow-lg focus:outline-none transition-all duration-300"
            onClick={handleSignupClick}
          >
            Sign Up
          </button>
        </div>
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

export default HeaderAccount;
