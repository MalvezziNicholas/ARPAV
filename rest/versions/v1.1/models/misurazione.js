const mongoose = require("mongoose");

const misurazioneSchema = mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  tipoInquinante: { type: String, required: true },
  data: { type: Date, required: true },
  mis: { type: Number, required: true },
  stazione: { type: mongoose.SchemaTypes.ObjectId, ref: "Stazione" },
});

module.exports = mongoose.model(
  "Misurazione",
  misurazioneSchema,
  "misurazioni"
);
