import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import CREATE_USER_MUTATION from "../../graphql/createUserMutation.ts";
import CloseIcon from "../../svg/CloseIcon.tsx";
import ProfileIcon from "../../svg/ProfileIcon.tsx";
import EmailIcon from "../../svg/EmailIcon.tsx";
import PasswordIcon from "../../svg/PasswordIcon.tsx";

interface SignupCardProps {
  onClose: () => void;
  onSignupSuccess: () => void;
}

const SignupCard = ({ onClose, onSignupSuccess }: SignupCardProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [createUser, { loading }] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: (data) => {
      onSignupSuccess(); // Appeler onSignupSuccess
      onClose(); // Fermer la carte d'inscription
    },
    onError: (error) => {
      setError(error.message); // Afficher l'erreur
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Réinitialiser l'erreur
    setError("");

    // Appeler la mutation pour créer un utilisateur
    createUser({ variables: { username, email, password } });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <CloseIcon />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Sign Up
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <ProfileIcon />
            </div>
          </div>

          {/* Email field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <EmailIcon />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordIcon />
            </div>
          </div>

          {/* Confirm password field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm password
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <PasswordIcon />
            </div>
          </div>

          {/* Display errors */}
          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupCard;
