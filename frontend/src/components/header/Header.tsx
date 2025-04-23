import React, { useState, useEffect } from "react";
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import SearchBar from "./SearchBar.tsx";
import RedirectButton from "./RedirectButton.tsx";
import HeaderAccount from "./HeaderAccount.tsx";
import HeaderProfile from "./HeaderProfile.tsx";
import Dbox from "../../svg/dbox-logo-white.svg"
import ShowMoreIcon from "../../svg/ShowMoreIcon.tsx";

const Header = ({ onSwitchPage }) => {
  const { privileges } = usePrivileges();
  const [extended, setExtended] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setExtended(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize) };
  }, []);

  return (
    <header className="sm:flex justify-between items-center p-4 bg-gray-800 text-white hover:cursor-pointer">
      <div className="flex justify-between items-center">
        <div id="logoDbox" onClick={() => { onSwitchPage("/"); }}>
          <img className="h-20" src={Dbox} alt="Dbox logo" />
        </div>
        <div className="flex gap-4 sm:hidden">
          <button
            className={`${extended ? "-rotate-90" : "rotate-90"} bg-gray-100 p-2 text-gray-800 rounded-md`}
            onClick={() => { setExtended(!extended) }}
          >
            <ShowMoreIcon />
          </button>
          {privileges?.isLoggedIn && <HeaderProfile onSwitchPage={onSwitchPage} />}
        </div>
      </div>
      <SearchBar />
      <div className={`${extended ? "flex flex-col w-full" : "hidden"} sm:flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0`}>
        <div className="w-full sm:w-auto">
          <RedirectButton onSwitchPage={onSwitchPage} page="/fm" text="DBox FM" />
        </div>
        {privileges?.isLoggedIn && (
          <div className="w-full sm:w-auto">
            <RedirectButton onSwitchPage={onSwitchPage} page="/publish" text="Publish" />
          </div>
        )}
        
        {privileges?.isModerator && (
          <div className="w-full sm:w-auto">
            <RedirectButton onSwitchPage={onSwitchPage} page="/moderation" text="Moderation" />
          </div>
        )}
        <HeaderAccount onSwitchPage={onSwitchPage} />
        <div className="hidden sm:block">
          {privileges?.isLoggedIn && <HeaderProfile onSwitchPage={onSwitchPage} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
