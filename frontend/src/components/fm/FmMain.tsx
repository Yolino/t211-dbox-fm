import React, { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { usePrivileges } from "../../context/PrivilegesContext.tsx";
import { useQuery, useMutation } from "@apollo/client";
import SCHEDULE_QUERY from "../../graphql/scheduleQuery.ts";
import CREATE_SCHEDULING_MUTATION from "../../graphql/createSchedulingMutation.ts"
import DELETE_SCHEDULING_MUTATION from "../../graphql/deleteSchedulingMutation.ts";
import FmSchedule from "./FmSchedule.tsx";
import FmUpdate from "./FmUpdate.tsx";
import FmTimeForm from "./FmTimeForm.tsx";
import Alert from "../Alert.tsx";

const FmMain = () => {
  const { privileges } = usePrivileges();
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPublicationId, setCurrentPublicationId] = useState(null);
  const [displayTimeForm, setDisplayTimeForm] = useState(null);
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
    time.setUTCHours(timeSlot, 0, 0, 0);
    setCurrentPublicationId(item.id)
    setDisplayTimeForm(time);
  };
  const handleFormSubmit = (time) => {
    createScheduling({
      variables: {
        publicationId: +currentPublicationId,
        time: time.toISOString().split('.')[0],
      }
    }).then(() => {
      refetch();
      setDisplayTimeForm(null);
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
      {errorMessage && <Alert type="error" text={errorMessage} onClose={() => { setErrorMessage(""); }} />}
      <div className="flex justify-center items-center gap-2">
        <FmSchedule date={date} loading={loading} error={error} schedule={schedule} setDate={setDate} incrementDate={incrementDate} handleDrop={handleDrop} handleDeleteScheduling={privileges?.isModerator ? handleDeleteScheduling : null} />
        {displayTimeForm && <FmTimeForm time={displayTimeForm} handleFormSubmit={handleFormSubmit} handleFormClose={() => { setDisplayTimeForm(null) }} />}
        {privileges?.isModerator && <FmUpdate />}
      </div>
    </DndProvider>
  );
};

export default FmMain;
