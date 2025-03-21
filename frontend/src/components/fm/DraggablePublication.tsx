import React from "react";
import { useDrag } from "react-dnd";

const DraggablePublication = ({ publication }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "publication",
    item: publication,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  return (
    <div
      ref={drag}
      className={`flex justify-center items-center gap-x-10 p-2 mb-4 bg-gray-200 text-white rounded-md cursor-pointer ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {publication.cover && <img
        className="h-full w-16 object-cover rounded-l-md"
        src={`http://localhost:8000${publication.cover}`}
        alt={`Cover for ${publication.title}`}
      />}
      <div>
        <p className="text-gray-800">{publication.author.username}</p>
        <h4 className="text-gray-800 font-bold">{publication.title}</h4>
      </div>
    </div>
  );
};

export default DraggablePublication;
