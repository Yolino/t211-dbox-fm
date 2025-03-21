const DeleteIcon = ({ onClick }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-gray-800 hover:text-red-600 transition-colors duration-300"
    onClick={onClick}
  >
    <path d="M3 6h18M9 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6M5 6h14L19 20H5z"/>
  </svg>
);

export default DeleteIcon;
