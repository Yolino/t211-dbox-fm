import React, { useState } from "react";
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import { useQuery } from "@apollo/client";
import SCHEDULE_QUERY from "../graphql/scheduleQuery.ts";

const FmMain = () => {
  const { privileges } = usePrivileges();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { loading, error, data } = useQuery(SCHEDULE_QUERY, {
    variables: { date },
  });
  const schedule = data?.schedule;

  const incrementDate = (increment) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + increment);
    setDate(currentDate.toISOString().split('T')[0]);
  };

  return (
    <div>
      <p>Dbox FM</p>
      {privileges?.isModerator && <p>You are a moderator</p>}

      <button onClick={() => { incrementDate(-1) }}>Previous</button>
      <input type="date" value={date} onChange={(e) => { setDate(e.target.value) }} />
      <button onClick={() => { incrementDate(1) }}>Next</button>

      {schedule?.length === 0 && <p>Nothing is scheduled for that date</p>}
      {schedule?.map((s) => (
        <p>{s.time} - {s.publication.title}</p>
      ))}
    </div>
  );
};

export default FmMain;
