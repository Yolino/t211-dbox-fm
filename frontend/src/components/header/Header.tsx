import React from "react";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import RedirectButton from "./RedirectButton.tsx";
import HeaderAccount from "./HeaderAccount.tsx";
import Dbox from "../../svg/dbox-logo-white.svg"

const Header = ({ onSwitchPage }) => {
  const { privileges } = usePrivileges();

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white hover:cursor-pointer">
      <div id="logoDbox" onClick={() => { onSwitchPage("/"); }}>
        <img className="h-20" src={Dbox} alt="Dbox logo" />
      </div>
      <div id="searchDiv" className="flex-grow mx-16">
        <input
          id="searchBar"
          type="text"
          placeholder="Search"
          className="p-3 rounded-lg w-96 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <RedirectButton onSwitchPage={onSwitchPage} page="/fm" text="DBox FM" />
        {privileges?.isLoggedIn && <RedirectButton onSwitchPage={onSwitchPage} page="/publish" text="Publish" />}
        {privileges?.isModerator && <RedirectButton onSwitchPage={onSwitchPage} page="/moderation" text="Moderation" />}
        <HeaderAccount onSwitchPage={onSwitchPage} />
      </div>
    </header>
  );
};

export default Header;
