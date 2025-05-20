import React, { useEffect, useRef, useState } from "react";

interface PopupWrapperProps {
  onClose: () => void;
  force: boolean;
  styleClass: string;
}

const PopupWrapper = ({ children, onClose=null, force=false, styleClass }: PopupWrapperProps) => {
  const popupRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDisabled(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (force || !isDisabled) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDisabled, force, onClose]);

  return (
    <div className={`${!force && isDisabled ? "" : "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"} ${styleClass}`}>
      <div ref={popupRef} className={`flex items-center justify-center m-1 ${force ? "" : "lg:h-full"}`}>
        {children}
      </div>
    </div>
  );
};

export default PopupWrapper;
