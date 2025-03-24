const MainBlock = ({ children, styleClass }) => (
  <div className={`max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg ${styleClass}`}>
    {children}
  </div>
);

export default MainBlock;
