// utils/formatTime.js

export const formatUnixTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", { hour12: false }); // Format as HH:MM:SS
  };
  