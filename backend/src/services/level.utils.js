exports.xpForNextLevel = (level) => {
  return Math.floor(120 + level * 15 + (level * level) / 10);
};
