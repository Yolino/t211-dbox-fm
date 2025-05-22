import React from "react";
import CloseIcon from "../svg/CloseIcon.tsx";

interface AlertProps {
  type: string;
  text: string;
  onClose: () => void;
}

const Alert = ({ type, text, onClose }: AlertProps) => {
  setTimeout(() => {
    onClose();
  }, 3000);

  return (
    <div
      className={`border px-5 py-7 rounded-md absolute top-5 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out ${
        type === "error"
          ? "bg-red-100 border-red-400 text-red-700"
          : type === "success"
          ? "bg-green-100 border-green-400 text-green-700"
          : "bg-blue-100 border-blue-400 text-blue-700"
      }`}
      role="alert"
    >
      <strong className="font-bold">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </strong>
      <span className="block ml-3 sm:inline">{text}</span>
      <span
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
      >
        <CloseIcon />
      </span>
    </div>
  );
};

export default Alert;
