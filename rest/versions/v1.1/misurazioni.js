const express = require("express");
const router = express.Router();
const authenticateToken = require("./authenticate");
const Misurazizone = require("./models/misurazione");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { stazione, data, mis, tipoInquinante, $where, $lookup } = req.query;
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
    let misurazioni;
    if ($lookup) {
      misurazioni = await Misurazizone.aggregate([
        {
          $lookup: {
            from: "stazioni",
            localField: "stazione",
            foreignField: "_id",
            as: "stazione",
          },
        },
        { $match: queryData },
        { $project: { _id: 1 } },
      ]);
    } else {
      misurazioni = await Misurazizone.find(queryData).select("_id");
    }
    let urls = [];
    for (const m of misurazioni) {
      urls.push(
        `${process.env.SERVER}:${process.env.SERVER_PORT}/v1.1/misurazioni/${m._id}`
      );
    }
    res.send(urls);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { $select } = req.query;
    const { id } = req.params;
    let parsedSelect = $select ? await JSON.parse($select) : {};
    const misurazione = await Misurazizone.findById(id, parsedSelect);
    res.send(misurazione);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
