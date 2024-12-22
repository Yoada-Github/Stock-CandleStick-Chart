import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SupportResistanceManager({ onAddLine, onResetLines }) {
  const handleAddLine = (type) => {
    const value = parseFloat(prompt(`Enter price value for the ${type} line:`));
    if (!isNaN(value)) {
      onAddLine(value); // Call the addLine function with the entered value
    } else {
      alert("Please enter a valid number.");
    }
  };

  return (
    <div className="mb-2 text-center support-resistance-manager">
      <button className="btn btn-primary mx-1" onClick={handleAddLine}>
        S.Line
      </button>
      <button className="btn btn-primary mx-1" onClick={handleAddLine}>
       R.Line
      </button>
      <button
        className="btn btn-danger mx-1"
        onClick={onResetLines}
      >
        Reset
      </button>
    </div>
  );
}

