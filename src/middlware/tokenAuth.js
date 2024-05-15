const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory user data (replace with database integration)
const users = [
  {
    id: 1,
    username: "admin",
    password: bcrypt.hashSync("password", 10), // Hashed password
  },
];

// Function to generate access and refresh tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
};

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const foundUser = users.find((user) => user.username === username);
  if (!foundUser)
    return res.status(401).json({ message: "Invalid username or password" });

  const validPassword = await bcrypt.compare(password, foundUser.password);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid username or password" });

  const { accessToken, refreshToken } = generateTokens(foundUser.id);
  res.json({ accessToken, refreshToken });
});

// Refresh token endpoint
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Missing refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { userId } = decoded;
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(userId);
    res.json({ accessToken, newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Secure endpoint (example)
app.get("/secure-data", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ message: "Welcome, authorized user!" });
  } catch (error) {
    res.status(401).json({ message: "Invalid access token" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
