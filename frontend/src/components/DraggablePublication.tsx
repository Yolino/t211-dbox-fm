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
      className={`p-2 mb-4 bg-blue-500 text-white rounded-md cursor-pointer ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {publication.title}
    </div>
  );
};

export default DraggablePublication;
