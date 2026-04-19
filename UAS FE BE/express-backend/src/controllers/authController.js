const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

function issueToken(user) {
  return jwt.sign(user, jwtSecret, { expiresIn: "1d" });
}

async function login(req, res) {
  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");

  // Keep parity with Flask credentials for initial migration.
  if (username !== "admin" || password !== "admin") {
    return res.status(401).json({ message: "Username atau password salah." });
  }

  const user = { username: "admin", role: "admin" };
  const token = issueToken(user);
  return res.json({ token, user });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

async function logout(_req, res) {
  return res.json({ message: "Logged out" });
}

module.exports = {
  login,
  me,
  logout,
};
