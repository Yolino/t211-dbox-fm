import React from "react";

interface DeletePublicationCardProps {
  title: string;
  onDeletePublication: () => void;
  onClose: () => void;
}

const DeletePublicationCard = ({ title, onDeletePublication, onClose }: DeletePublicationCardProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <p className="font-bold text-center mb-6 text-gray-800 text-lg">You are about to delete</p>
        <p className="text-4xl text-gray-700 mb-2 text-center">{title}</p>
        <p className="font-bold text-center mb-6 text-gray-800 text-lg">Are you sure ?</p>
        <div className="flex justify-end gap-4">
          <button onClick={onDeletePublication} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">Yes</button>
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">No</button>
        </div>
      </div>
    </div>
  );
};

export default DeletePublicationCard;
