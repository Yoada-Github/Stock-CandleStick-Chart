import React, { useState } from "react";
import ChartContainer from "./components/ChartContainer";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [timeframe, setTimeframe] = useState("daily");

  return (
      <div className="container" >
      <h1 className="text-center mb-2 text-black">Indian Stocks Financial Chart </h1>
      <div className="chart-container">
        <ChartContainer  timeframe={timeframe}/>
      </div>
    </div>
  );
}
