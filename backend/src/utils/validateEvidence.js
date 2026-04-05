module.exports = function validateEvidence(title, url) {

  if (!url) return false;

  // Basic rule-based validation

  if (title === "Deployment") {
    return url.includes("http");
  }

  if (title === "Development") {
    return url.includes("github");
  }

  if (title === "UI / Design") {
    return url.includes("figma") || url.includes("dribbble");
  }

  // Default
  return true;
};