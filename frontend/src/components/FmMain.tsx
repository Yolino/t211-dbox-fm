import React from "react";
import { usePrivileges } from "../context/PrivilegesContext.tsx";

const FmMain = () => {
  const { privileges } = usePrivileges();

  return (
    <div>
      <p>Dbox FM</p>
      {privileges?.isModerator && <p>You are a moderator</p>}
    </div>
  );
};

export default FmMain;
