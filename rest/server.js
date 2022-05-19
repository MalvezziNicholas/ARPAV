const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const app = express();

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Server started on ${process.env.SERVER}:${process.env.SERVER_PORT}`
  );
});

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected successfully to the database"))
  .catch((err) => console.error(err));

app.use(express.json());
app.use(cors());

const v1_1 = require("./versions/v1.1");
app.use("/v1.1/stazioni", v1_1.stazioni);
app.use("/v1.1/misurazioni", v1_1.misurazioni);
app.use("/v1.1/stats", v1_1.stats);
