// src/utils/getScriptChunk.js

export const getScriptChunk = (time) => {
  if (time < 15) return "0_15";
  if (time < 40) return "15_40";
  if (time < 75) return "40_75";
  if (time < 100) return "76_100";
  if (time < 135) return "101_135";
  if (time < 190) return "136_190";
  if (time < 225) return "191_225";
  if (time < 255) return "226_255";
  if (time < 300) return "256_300";
  if (time < 340) return "300_340";
  if (time < 375) return "341_375";
  if (time < 405) return "376_405";
  if (time <= 425) return "406_425";
  return null;
};

export const getNextScriptChunk = (chunk) => {
  const order = [
    "0_15", "15_40", "40_75", "76_100", "101_135",
    "136_190", "191_225", "226_255", "256_300",
    "300_340", "341_375", "376_405", "406_425"
  ];
  const idx = order.indexOf(chunk);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
};
