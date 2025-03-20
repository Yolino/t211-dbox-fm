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
    <div className="p-2 border-t-2">
      <div ref={drop} className={`flex items-start space-x-4 p-4 -mb-4 border-gray-200 ${isOver ? "bg-blue-300" : "bg-gray-800"} rounded-lg`}>
        <div className="w-1/6 text-gray-200 font-semibold">{label}</div>
        <div className="flex-1 flex flex-col space-y-2">
          {schedule.length > 0 && (
            schedule.map((s) => (
              <div className="flex justify-center items-center gap-x-10 p-2 bg-gray-200 text-white rounded-md">
                {s.publication.cover && <img
                  className="h-full w-16 object-cover rounded-l-md"
                  src={`http://localhost:8000${s.publication.cover}`}
                  alt={`Cover for ${s.publication.title}`}
                />}
                <div className="flex-1 bg-gray-200 rounded-md p-2">
                  <p className="text-gray-800">{s.publication.author.username}</p>
                  <h4 className="text-gray-800 font-bold">{s.publication.title}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DroppableSlot;
