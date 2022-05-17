const express = require("express");
const router = express.Router();
const authenticateToken = require("./authenticate");
const Stazione = require("./models/stazione");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { nome, localita, comune, tipozona, provincia, $where, $lookup } =
      req.query;
    let queryData = {};
    nome && (queryData.nome = nome);
    localita && (queryData.localita = localita);
    comune && (queryData.comune = comune);
    tipozona && (queryData.tipozona = tipozona);
    provincia && (queryData.provincia = provincia);
    if ($where) {
      if ($where.length > 300) {
        throw new RangeError(
          "to avoid server saturation $where has a 300 chars cap"
        );
      }
      const parsedWhere = await JSON.parse($where);
      queryData = { $and: [queryData, parsedWhere] };
    }
    let stazioni;
    if ($lookup) {
      stazioni = await Stazione.aggregate([
        {
          $lookup: {
            from: "misurazioni",
            localField: "misurazioni",
            foreignField: "_id",
            as: "misurazioni",
          },
        },
        { $match: queryData },
        { $project: { _id: 1 } },
      ]);
    } else {
      stazioni = await Stazione.find(queryData).select("_id");
    }
    let urls = [];
    for (const s of stazioni) {
      urls.push(
        `${process.env.SERVER}:${process.env.SERVER_PORT}/v1.1/stazioni/${s._id}`
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
    const stazione = await Stazione.findById(id, parsedSelect);
    res.send(stazione);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
