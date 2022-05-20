const express = require("express");
const router = express.Router();
const authenticateToken = require("./authenticate");
const Misurazizone = require("./models/misurazione");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { stazione, data, mis, tipoInquinante, $where, $lookup, $group } =
      req.query;
    let queryData = {};
    stazione && (queryData.stazione = stazione);
    data && (queryData.data = data);
    mis && (queryData.mis = mis);
    tipoInquinante && (queryData.tipoInquinante = tipoInquinante);
    if ($where) {
      if ($where.length > 300) {
        throw new RangeError(
          "to avoid server saturation $where has a 300 chars cap"
        );
      }
      const parsedWhere = await JSON.parse($where);
      queryData = { $and: [queryData, parsedWhere] };
    }
    if (!$group) throw new Error("$group must be set");
    if ($group.length > 200) {
      throw new RangeError(
        "to avoid server saturation $group has a 200 chars cap"
      );
    }
    let pipeline = [];
    $lookup &&
      pipeline.push({
        $lookup: {
          from: "stazioni",
          localField: "stazione",
          foreignField: "_id",
          as: "stazione",
        },
      });
    pipeline.push({ $match: queryData });
    pipeline.push({ $group: await JSON.parse($group) });
    const response = await Misurazizone.aggregate(pipeline);
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
