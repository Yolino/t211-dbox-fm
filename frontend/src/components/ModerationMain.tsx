import React from "react";
import { usePrivileges } from "../context/PrivilegesContext.tsx";

const ModerationMain = () => {
  const { privileges } = usePrivileges();

  if (!privileges?.isModerator) return <p>You cannot access the moderation panel</p>;

  return (
    <p>This is the moderation panel</p>
  );
};

export default ModerationMain;
