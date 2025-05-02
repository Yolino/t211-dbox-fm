import React from "react";

interface BadgeProps {
  count: number;
}

const Badge = ({ count, children }: BadgeProps) => {
  return (
    <div className="relative inline-block">
      {children}
      {count !== null && (
        <span
          className={`absolute -top-1 -right-1 text-gray-100 text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-600`}
        >
          {count}
        </span>
      )}
    </div>
  );
}

export default Badge;
