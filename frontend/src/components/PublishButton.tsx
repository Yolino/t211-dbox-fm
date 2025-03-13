import React from "react";

const PublishButton = ({ onSwitchPage }) => {
  const switchPage = () => {
    onSwitchPage("publish");
  }

  return (
    <button onClick={switchPage}>Publish</button>
  );
}

export default PublishButton;
