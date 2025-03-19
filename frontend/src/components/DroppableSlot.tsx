import React from "react";
import { useDrop } from "react-dnd";

const DroppableSlot = ({ label, timeSlot, schedule, handleDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "publication",
    drop: (item) => {
      handleDrop(item, timeSlot);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`p-4 border ${isOver ? "bg-blue-300" : "bg-gray-200"} rounded-lg`}>
      <div className="w-1/6 text-gray-800 font-semibold">{label}</div>
      <div className="flex-1 flex flex-col space-y-2">
        {schedule.length > 0 && (
          schedule.map((s) => (
            <div className="flex-1 bg-gray-800 rounded-md border-dashed border-2 p-2">
              <h4 className="text-white font-bold">{s.publication.title}</h4>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DroppableSlot;
