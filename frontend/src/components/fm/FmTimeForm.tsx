import React from "react";
import CloseIcon from "../../svg/CloseIcon.tsx";

const FmTimeForm = ({ time, handleFormSubmit, handleFormClose }) => {
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    time.setMinutes(event.target.value);
  }
  const onSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(time);
    handleFormClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-96 relative items-center">
        <button onClick={handleFormClose} className="absolute top-4 right-4">
          <CloseIcon />
        </button>
        <h3 className="text-center font-bold mb-2">Please set the precise time</h3>
        <div className="flex items-center space-x-2 justify-center">
          <p className="text-xl">{time.getUTCHours().toString().padStart(2, "0")} : </p>
          <input type="number" min="0" max="59" step="1" defaultValue="0" onChange={handleTimeChange} className="ml-2 w-[4ch] text-xl text-center text-gray-800" />
        </div>
        <button type="submit" className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">Submit</button>
      </form>
    </div>
  );
}

export default FmTimeForm;
