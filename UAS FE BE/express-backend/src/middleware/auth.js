const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = {
  authRequired,
};
