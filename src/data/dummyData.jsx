export const getDummyData = (timeframe) => {
  const baseTime = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  const timeframes = {
    "3min": 3 * 60,
    "5min": 5 * 60,
    "15min": 15 * 60,
    daily: 24 * 60 * 60,
  };

  const interval = timeframes[timeframe];
  if (!interval) {
    console.error(`Invalid timeframe: ${timeframe}`);
    return [];
  }

  const dummyData = [];

  for (let i = 0; i < 50; i++) {
    const time = baseTime - i * interval;

    // Convert to local time
    const localTime = new Date(time * 1000).getTime() / 1000;

    const open = Math.random() * 100 + 1000;
    const close = Math.random() * 100 + 1000;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;

    dummyData.push({ time: localTime, open, high, low, close });
  }

  dummyData.sort((a, b) => a.time - b.time); // Ensure data is sorted by time
  return dummyData;
};
