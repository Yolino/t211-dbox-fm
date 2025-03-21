import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import LOGIN_MUTATION from "../../graphql/loginMutation.ts";
import CloseIcon from "../../svg/CloseIcon.tsx";
import ProfileIcon from "../../svg/ProfileIcon.tsx";
import PasswordIcon from "../../svg/PasswordIcon.tsx";

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
        onLoginSuccess(); // Appeler onLoginSuccess
        onClose(); // Fermer la carte de connexion
      } else {
        setError("Invalid credentials.");
      }
    },
    onError: (error) => {
      setError("An error occured whilst trying to log you in.");
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <CloseIcon />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Log In
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

          {/* Error displaying */}
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCard;
