function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Not found" });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
