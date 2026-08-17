const Population = require("../models/Population");

exports.getPopulationEstimation = async (req, res) => {
  try {
    const populations = await Population.find();

    const totalSpecies = populations.length;

    const totalPopulation = populations.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const averagePopulation =
      totalSpecies > 0
        ? (totalPopulation / totalSpecies).toFixed(2)
        : 0;

    const increasing = populations.filter(
      (p) => p.status === "Increasing"
    ).length;

    const decreasing = populations.filter(
      (p) => p.status === "Decreasing"
    ).length;

    const stable = populations.filter(
      (p) => p.status === "Stable"
    ).length;

    const endangered = populations.filter(
      (p) => p.status === "Endangered"
    ).length;

    let trend = "Stable";

    if (increasing > decreasing) trend = "Increasing";
    else if (decreasing > increasing) trend = "Decreasing";

    res.json({
      success: true,
      data: {
        totalSpecies,
        totalPopulation,
        averagePopulation,
        trend,
        stable,
        increasing,
        decreasing,
        endangered,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};