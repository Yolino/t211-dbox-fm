import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const LOGIN_MUTATION = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      success
      user {
        id
        username
        email
      }
    }
  }
`;

interface LoginCardProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginCard = ({ onClose, onLoginSuccess }: LoginCardProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.loginUser.success) {
        console.log("Connexion réussie !");
        onLoginSuccess(); // Appeler onLoginSuccess
        onClose(); // Fermer la carte de connexion
      } else {
        setError("Identifiants invalides.");
      }
    },
    onError: (error) => {
      setError("Une erreur s'est produite lors de la connexion.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    loginUser({ variables: { username, password } });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 relative">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Titre */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Se connecter
        </h2>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {/* Champ Nom d'utilisateur */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Connexion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCard;