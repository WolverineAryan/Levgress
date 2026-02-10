function checkCriteria(criteria, stats) {
  for (const field in criteria) {
    const rule = criteria[field];
    const value = stats[field];

    if (typeof rule === "object") {
      if (rule.$gte !== undefined && value < rule.$gte) return false;
      if (rule.$lte !== undefined && value > rule.$lte) return false;
      if (rule.$eq !== undefined && value !== rule.$eq) return false;
    } else {
      if (value !== rule) return false;
    }
  }
  return true;
}

module.exports = { checkCriteria };
