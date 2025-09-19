import React from "react";

export default function AlertMessage({ type = "info", children }) {
  const color =
    type === "success"
      ? "bg-green-100 text-green-700"
      : type === "error"
      ? "bg-red-100 text-red-700"
      : "bg-blue-100 text-blue-700";
  return (
    <div className={`mt-4 text-center font-semibold px-4 py-2 rounded-xl ${color}`}>
      {children}
    </div>
  );
}
