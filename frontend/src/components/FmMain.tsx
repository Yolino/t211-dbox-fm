import React, { useState } from "react";
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import { useQuery } from "@apollo/client";
import SCHEDULE_QUERY from "../graphql/scheduleQuery.ts";

const FmMain = () => {
  const { privileges } = usePrivileges();
  const [date, setDate] = useState(new Date());
  const { loading, error, data } = useQuery(SCHEDULE_QUERY, {
    variables: { date },
  });
  console.log(data);

  return (
    <div>
      <p>Dbox FM</p>
      {privileges?.isModerator && <p>You are a moderator</p>}
    </div>
  );
};

export default FmMain;
