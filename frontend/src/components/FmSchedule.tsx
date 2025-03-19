import React, { useState } from "react";
import DroppableSlot from "./DroppableSlot.tsx";

const FmSchedule = ({ date, schedule, incrementDate, handleDrop }) => {
  const startHour = 0;
  const endHour = 23;
  const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, index) => ({
    label: `${startHour + index}:00`,
    start: startHour + index,
    end: startHour + index + 1,
  }));

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-800 shadow-lg rounded-lg h-[800px] flex flex-col">
      <div className="flex justify-center items-center space-x-10">
        <button
          onClick={() => { incrementDate(-1) }}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >Previous</button>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value) }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => { incrementDate(1) }}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >Next</button>
      </div>
      <h2 className="text-2xl text-center font-bold text-white mt-6 mb-6">Schedule for {date}</h2>
      <div className="flex-1 overflow-y-auto space-y-4 px-2 max-h-[700px]">
        {timeSlots.map(({ label, start, end }, index) => {
          const slotSchedule = schedule.filter((s) => {
            const eventHour = new Date(s.time).getHours();
            return start <= eventHour && eventHour < end;
          });
          return (
            <DroppableSlot
              key={index}
              label={label}
              timeSlot={start}
              className={`flex items-start space-x-4 ${index !== timeSlots.length - 1 ? "border-b border-gray-300 pb-3" : ""}`}
              schedule={slotSchedule}
              handleDrop={handleDrop}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FmSchedule;
