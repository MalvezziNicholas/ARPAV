const express = require("express");
const User = require("./models/user");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

require("dotenv").config();

const jwt = require("jsonwebtoken");

app.use(express.json());

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected successfully to the database"))
  .catch((err) => console.error(err));

// change put this in database
let refreshTokens = [];

app.listen(process.env.AUTENTICATE_PORT, () => {
  console.log(
    `Authentication server started on ${process.env.SERVER}:${process.env.AUTENTICATE_PORT}`
  );
});

app.use(cors());

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
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      return res.status(500);
    } else if (user === null) {
      return res.status(400).send({
        error: "User not found.",
      });
    } else {
      if (user.validPassword(password)) {
        const userData = { username };
        const accessToken = jwt.sign(userData, process.env.ACCESS_TOKEN, {
          expiresIn: process.env.EXPIRATION_TIME,
        });
        const refreshToken = jwt.sign(userData, process.env.REFRESH_TOKEN);
        if (!refreshTokens.includes(refreshToken))
          refreshTokens.push(refreshToken);
        return res.status(201).send({ accessToken, refreshToken });
      } else {
        return res.status(400).send({
          error: "Wrong Password",
        });
      }
    }
  });
});
