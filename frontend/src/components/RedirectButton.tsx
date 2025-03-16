import React from "react";

const RedirectButton = ({ onSwitchPage, page, text }) => {
  const switchPage = () => {
    onSwitchPage(page);
  }

  return (
    <button onClick={switchPage}>{text}</button>
  );
};

export default RedirectButton;
