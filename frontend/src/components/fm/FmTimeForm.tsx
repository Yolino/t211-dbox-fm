import React, { useState } from "react";
import MainBlock from "../MainBlock.tsx";
import CloseIcon from "../../svg/CloseIcon.tsx";

const FmTimeForm = ({ time, handleFormSubmit, handleFormClose }) => {
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    time.setMinutes(event.target.value);
  }
  const onSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(time);
  };

  return (
    <MainBlock>
      <form onSubmit={onSubmit} className="text-white">
        <button onClick={handleFormClose}>
          <CloseIcon />
        </button>
        <div className="flex">
          <p>{time.getUTCHours().toString().padStart(2, "0")} : </p>
          <input type="number" min="0" max="59" step="1" defaultValue="0" onChange={handleTimeChange} className="ml-2 w-[4ch] text-center text-gray-800" />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">Submit</button>
      </form>
    </MainBlock>
  );
}

export default FmTimeForm;
