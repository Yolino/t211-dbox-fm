import React from "react";

const RedirectButton = ({ onSwitchPage, page, text }) => {
  const switchPage = () => {
    onSwitchPage(page);
  };

  return (
    <button
  onClick={switchPage}
  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
  >
  {text}
</button>
  );
};

export default RedirectButton;