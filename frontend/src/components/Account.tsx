import React from "react";

const Account = () => {
  return (
    <div className="LogButtons">
      <button
        id="logIn"
        className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded"
      >
        Se connecter
      </button>
      <button
        id="signIn"
        className="bg-black hover:bg-gray-900 text-white font-bold py-3 px-6 rounded ml-5 mr-2"
      >
        S'inscrire
      </button>
    </div>
  );
};

export default Account;
