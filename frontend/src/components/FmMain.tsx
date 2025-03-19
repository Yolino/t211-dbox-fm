import React from "react";
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import FmSchedule from "./FmSchedule.tsx";

const FmMain = () => {
  const { privileges } = usePrivileges();
  return (
    <div>
      {privileges?.isModerator && <p>You are a moderator</p>}
      <FmSchedule />
    </div>
  );
};

export default FmMain;
