import React from "react";
import PublishButton from "./PublishButton.tsx";
import Account from "./Account.tsx";

const Header = ({ onSwitchPage }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div id="logoDbox" onClick={() => { onSwitchPage("/"); }}>
        <p className="font-bold text-5xl">Dbox</p>
      </div>
      <div id="searchDiv" className="flex-grow mx-16"> {/* Ajoute une marge à gauche pour l'espacement */}
        <input
          id="searchBar"
          type="text"
          placeholder="Search"
          className="p-3 rounded-lg w-96 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <PublishButton onSwitchPage={onSwitchPage} />
        <Account onSwitchPage={onSwitchPage} />
      </div>
    </header>
  );
};

export default Header;
