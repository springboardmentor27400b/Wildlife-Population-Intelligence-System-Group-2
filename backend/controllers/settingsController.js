exports.getSettings = async (req, res) => {
  res.status(200).json({
    success: true,
    settings: {
      systemName: "Wildlife Population Intelligence System",
      version: "1.0.0",
      database: "MongoDB",
      backend: "Node.js + Express",
      frontend: "React + Vite",
      status: "Active",
    },
  });
};