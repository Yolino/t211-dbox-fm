import React, { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { usePrivileges } from "../context/PrivilegesContext.tsx";
import { useQuery, useMutation } from "@apollo/client";
import SCHEDULE_QUERY from "../graphql/scheduleQuery.ts";
import CREATE_SCHEDULING_MUTATION from "../graphql/createSchedulingMutation.ts"
import DELETE_SCHEDULING_MUTATION from "../graphql/deleteSchedulingMutation.tsx";
import FmSchedule from "./FmSchedule.tsx";
import FmUpdate from "./FmUpdate.tsx";

const FmMain = () => {
  const { privileges } = usePrivileges();
  const [errorMessage, setErrorMessage] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const incrementDate = (increment) => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + increment);
    setDate(currentDate.toISOString().split('T')[0]);
  };
  const { loading, error, data, refetch } = useQuery(SCHEDULE_QUERY, {
    variables: { date },
  });
  const schedule = data?.schedule || [];
  const [createScheduling] = useMutation(CREATE_SCHEDULING_MUTATION);
  const handleDrop = (item, timeSlot) => {
    setErrorMessage("");
    const time = new Date(date);
    time.setHours(timeSlot, 0, 0, 0);
    createScheduling({
      variables: {
        publicationId: +item.id,
        time: time.toISOString().split('.')[0],
      }
    }).then(() => {
      refetch();
    }).catch((err) => {
      setErrorMessage(err.message);
    });
  };
  const [deleteScheduling] = useMutation(DELETE_SCHEDULING_MUTATION);
  const handleDeleteScheduling = (schedulingId) => {
    setErrorMessage("");
    deleteScheduling({
      variables : { schedulingId: +schedulingId },
    }).then(() => {
        refetch();
      }).catch((err) => {
        setErrorMessage(err.message);
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {errorMessage && <div className="mb-4 text-center text-sm text-red-600">{errorMessage}</div>}
      <div className="flex justify-center items-center">
        <FmSchedule date={date} schedule={schedule} incrementDate={incrementDate} handleDrop={handleDrop} handleDeleteScheduling={privileges?.isModerator ? handleDeleteScheduling : null} />
        {privileges?.isModerator && <FmUpdate />}
      </div>
    </DndProvider>
  );
};

export default FmMain;
