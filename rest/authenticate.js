const express = require("express");
const app = express();
const PORT = 8001;

require("dotenv").config();

const jwt = require("jsonwebtoken");

app.use(express.json());

// change put this in database
let refreshTokens = [];

app.listen(PORT, () => {
  console.log(`Authentication server started on ${process.env.SERVER}:${PORT}`);
});

app.post("/verify", (req, res) => {
  jwt.verify(req.body.token, process.env.ACCESS_TOKEN, (err) => {
    if (err) return res.sendStatus(403);
    res.sendStatus(204);
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: user.username },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: process.env.EXPIRATION_TIME,
      }
    );
    return res.json({ accessToken });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // login from db

  const userData = { username };

  const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN, {
    expiresIn: process.env.EXPIRATION_TIME,
  });
  const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN);
  if (!refreshTokens.includes(refreshToken)) refreshTokens.push(refreshToken);

  res.send({ accessToken, refreshToken });
});
