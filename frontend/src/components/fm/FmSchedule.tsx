import React from "react";
import MainBlock from "../MainBlock.tsx";
import DroppableSlot from "./DroppableSlot.tsx";
import ShowMoreIcon from "../../svg/ShowMoreIcon.tsx";
import LoadingIcon from "../../svg/LoadingIcon.tsx";

const FmSchedule = ({ date, loading, error, schedule, setDate, incrementDate, handleDrop, handleDeleteScheduling }) => {
  const startHour = 0;
  const endHour = 23;
  const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, index) => ({
    label: `${startHour + index}:00`,
    start: startHour + index,
    end: startHour + index + 1,
  }));

  return (
    <MainBlock styleClass="w-full">
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => { incrementDate(-1) }}
          className="rotate-180 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ShowMoreIcon />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value) }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { incrementDate(1) }}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ShowMoreIcon />
        </button>
      </div>
      {error && <p className="text-center text-red-500">{error}</p>}
      <div className="flex justify-center items-center text-white space-x-4">
        {loading && <LoadingIcon />}
        <h2 className="text-2xl font-bold mt-6 mb-6">Schedule for {date}</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 px-2 max-h-[700px]">
        {timeSlots.map(({ label, start, end }, index) => {
          const slotSchedule = schedule.filter((s) => {
            const eventHour = new Date(s.time).getUTCHours();
            return start <= eventHour && eventHour < end;
          });
          return (
            <DroppableSlot
              key={index}
              label={label}
              timeSlot={start}
              schedule={slotSchedule}
              handleDrop={handleDrop}
              handleDeleteScheduling={handleDeleteScheduling}
            />
          );
        })}
      </div>
    </MainBlock>
  );
};

export default FmSchedule;
