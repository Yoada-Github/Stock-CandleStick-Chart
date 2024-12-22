import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import SupportResistanceManager from "./SupportResistanceManager";
import TimeframeSelector from "./TimeframeSelector";

export default function ChartContainer() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const candleSeries = useRef(null);
  const volumeSeries = useRef(null);
  const lineSeries = useRef([]);
  const [timeframe, setTimeframe] = useState("10s");
  const [tooltip, setTooltip] = useState(null);

  // Convert timeframes to seconds
  const timeframesInSeconds = {
    "10s": 1 * 10,
    "3m": 3 * 60,
    "5m": 5 * 60,
    "15m": 15 * 60,
    "1D": 24 * 60 * 60,
  };

  const [liveCandle, setLiveCandle] = useState(null);
  const [intervalStartTime, setIntervalStartTime] = useState(
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    // Initialize the chart
    chartInstance.current = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 590,
      layout: {
        background: {
          type: "solid",
          color: "#000000", // Solid black background
        },
        textColor: "#FFFFFF", // White text
      },
      grid: {
        vertLines: { color: "#222222" },
        horzLines: { color: "#222222" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#FFFFFF", width: 1, style: 1 }, // White crosshair vertical line
        horzLine: { color: "#FFFFFF", width: 1, style: 1 }, // White crosshair horizontal line
      },
      priceScale: { borderColor: "#444444" },
      timeScale: {
        borderColor: "#444444",
        timeVisible: true,
        tickMarkFormatter: (timestamp) => {
          const date = new Date(timestamp * 1000); // Convert to milliseconds
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true, // Use true for AM/PM or false for 24-hour format
          });
        },
      },
    });

    candleSeries.current = chartInstance.current.addCandlestickSeries({
      upColor: "#4caf50",
      downColor: "#f44336",
      borderDownColor: "#f44336",
      borderUpColor: "#4caf50",
      wickDownColor: "#737373",
      wickUpColor: "#737373",
    });

    

    volumeSeries.current = chartInstance.current.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
      lineWidth: 1,
    });

    const initialData = generateInitialData(timeframe);
    candleSeries.current.setData(initialData);
    volumeSeries.current.setData(
      initialData.map(({ time, open, close, volume }) => ({
        time,
        value: volume,
        color: close > open ? "#4caf50" : "#f44336", // Green for bullish, red for bearish
      }))
    );

    // Tooltip display logic
    chartInstance.current.subscribeCrosshairMove(function (param) {
      const price = param?.point || null;
      if (!price || !param.seriesData) {
        setTooltip(null);
        return;
      }
      
      const candlestick = param.seriesData.get(candleSeries.current);
      const volume = param.seriesData.get(volumeSeries.current);

      if (candlestick) {
        setTooltip({
          time: new Date(candlestick.time * 1000).toLocaleTimeString(),
          open: candlestick.open.toFixed(2),
          high: candlestick.high.toFixed(2),
          low: candlestick.low.toFixed(2),
          close: candlestick.close.toFixed(2),
          volume: volume ? volume.value.toFixed(2) : "N/A",
        });
      }
    });

    const handleResize = () => {
      chartInstance.current.applyOptions({
        width: chartRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current.remove();
    };
  }, []);

  useEffect(() => {
    const intervalDuration = timeframesInSeconds[timeframe];
    const now = Math.floor(Date.now() / 1000);
    setIntervalStartTime(now - (now % intervalDuration));

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);

      if (!liveCandle) {
        const open = Math.random() * 100 + 1000;
        const close = Math.random() * 100 + 1000;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        const volume = Math.abs(close - open) * 10;

        setLiveCandle({
          time: intervalStartTime,
          open,
          high,
          low,
          close,
          volume,
        });
      }

      // Simulate live price
      const newPrice = Math.random() * 100 + 1000;

      setLiveCandle((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          high: Math.max(prev.high, newPrice),
          low: Math.min(prev.low, newPrice),
          close: newPrice,
          volume: prev.volume + Math.abs(newPrice - prev.close) * 10,
        };
      });

      // Finalize candle when timeframe ends
      if (currentTime >= intervalStartTime + intervalDuration) {
        if (liveCandle) {
          candleSeries.current.update(liveCandle);
          volumeSeries.current.update({
            time: liveCandle.time,
            value: liveCandle.volume,
            color: liveCandle.close > liveCandle.open ? "#4caf50" : "#f44336", // Green for bullish, red for bearish

          });
        }

        // Start new interval and candle
        setIntervalStartTime(currentTime);
        const open = newPrice;
        setLiveCandle({
          time: currentTime,
          open,
          high: open,
          low: open,
          close: open,
          volume: 0,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeframe, liveCandle]);

  const generateInitialData = (timeframe) => {
    const interval = timeframesInSeconds[timeframe];
    const baseTime = Math.floor(Date.now() / 1000);
    const initialData = [];

    for (let i = 50; i > 0; i--) {
      const time = baseTime - i * interval;
      const open = Math.random() * 100 + 1000;
      const close = Math.random() * 100 + 1000;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      const volume = Math.abs(close - open) * 10;

      initialData.push({ time, open, high, low, close, volume });
    }
    return initialData;
  };

  // Add a support/resistance line
  const addLine = (value) => {
    if (!candleSeries.current) return;

    const lastTime = intervalStartTime + timeframesInSeconds[timeframe];
    const firstTime = intervalStartTime - 50 * timeframesInSeconds[timeframe];

    // Add the line series
    const newLine = chartInstance.current.addLineSeries({
      color: value >= (liveCandle?.close || 0) ? "green" : "red", 
      lineWidth: 1,
    });

    // Set the data for the line
    newLine.setData([
      { time: firstTime, value },
      { time: lastTime, value },
    ]);

    // Track the added line
    lineSeries.current.push(newLine);
  };

  const resetLines = () => {
    if (!chartInstance.current) {
      console.error("Chart instance is not initialized.");
      return;
    }

    if (lineSeries.current && lineSeries.current.length > 0) {
      lineSeries.current.forEach((newLine, index) => {
        console.log(`Removing line series at index ${index}:`, newLine);
        if (newLine) {
          chartInstance.current.removeSeries(newLine);
        }
      });

      // Clear the array after removing
      lineSeries.current = [];
      console.log("All lines reset successfully.");
    } else {
      console.log("No lines to reset.");
    }
  };

  return (
    <div>
      <div className="d-flex">
        <TimeframeSelector
          selectedTimeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
        <SupportResistanceManager onAddLine={addLine} onResetLines={resetLines} />
      </div>
      <div
        ref={chartRef}
        style={{
          position: "relative",
          width: "100%",
          height: "500px",
          border: "1px solid #ccc",
        }}
      />
      
      {tooltip && (
        <div
          className="tooltip-container"
          style={{
            top: "50px", 
            left: "10px", 
          }}
        >
      <div className="tooltip-row">
        <span className="tooltip-label">O</span>
        <span className="tooltip-value"
        style={{
          color: parseFloat(tooltip.close) > parseFloat(tooltip.open)
            ? "#4caf50" // Green if the candlestick is bullish (close > open)
            : "#f44336", // Red if the candlestick is bearish (close < open)
        }}
        >{tooltip.open}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">H</span>
        <span className="tooltip-value"
        style={{
          color: parseFloat(tooltip.close) > parseFloat(tooltip.open)
            ? "#4caf50" // Green if the candlestick is bullish (close > open)
            : "#f44336", // Red if the candlestick is bearish (close < open)
        }}
        >{tooltip.high}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">L</span>
        <span className="tooltip-value"
        style={{
          color: parseFloat(tooltip.close) > parseFloat(tooltip.open)
            ? "#4caf50" // Green if the candlestick is bullish (close > open)
            : "#f44336", // Red if the candlestick is bearish (close < open)
        }}
        >{tooltip.low}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">C</span>
        <span className="tooltip-value"
        style={{
          color: parseFloat(tooltip.close) > parseFloat(tooltip.open)
            ? "#4caf50" // Green if the candlestick is bullish (close > open)
            : "#f44336", // Red if the candlestick is bearish (close < open)
        }}
        >{tooltip.close}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">V</span>
        <span className="tooltip-value"
        style={{
          color: parseFloat(tooltip.close) > parseFloat(tooltip.open)
            ? "#4caf50" // Green if the candlestick is bullish (close > open)
            : "#f44336", // Red if the candlestick is bearish (close < open)
        }}
        >{tooltip.volume}</span>
      </div>
    </div>
   )}

  </div>
  );
}


