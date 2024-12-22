import React from "react";

export default function TimeframeSelector({ selectedTimeframe, onTimeframeChange }) {
  const timeframes = ["3m", "5m", "15m", "1D"];

  return (
    <div className="btn-group d-flex justify-content-center  timeframe-selector">
      {timeframes.map((tf) => (
        <button
          key={tf}
          className={`btn rounded ${
            selectedTimeframe === tf ? "btn-success" : "btn-primary"
          }`}
          onClick={() => onTimeframeChange(tf)}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
