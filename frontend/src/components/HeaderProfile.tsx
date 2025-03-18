import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import LOGOUT_MUTATION from "../graphql/logoutMutation.ts";

const HeaderProfile = ({ onSwitchPage }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutUser] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      console.log("Déconnexion réussie !");
      window.location.reload(); // Recharger la page pour refléter la déconnexion
    },
    onError: (error) => {
      console.error("Erreur lors de la déconnexion :", error.message);
    },
  });
  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="relative">
      {/* Bouton de profil */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Menu déroulant */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
          <button
            onClick={() => { onSwitchPage("/profile"); }}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Paramètres du profil
          </button>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderProfile;
