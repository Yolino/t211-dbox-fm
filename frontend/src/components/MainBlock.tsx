const MainBlock = ({ children, styleClass }) => (
  <div className={`mx-auto p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col ${styleClass}`}>
    {children}
  </div>
);

export default MainBlock;
