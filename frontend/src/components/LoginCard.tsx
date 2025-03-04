import React from "react";

interface LoginCardProps {
  onClose: () => void; // Fonction pour fermer la carte
}

const LoginCard = ({ onClose }: LoginCardProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Se connecter</h2>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="username">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 border rounded"
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border rounded"
              placeholder="Entrez votre mot de passe"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCard;
