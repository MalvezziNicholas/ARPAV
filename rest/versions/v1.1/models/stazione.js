const mongoose = require("mongoose");

const stazioneSchema = mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  nome: { type: String, required: true },
  localita: { type: String, required: true },
  comune: { type: String, required: true },
  provincia: { type: String, required: true },
  tipozona: { type: String, required: true },
  lat: { type: Number },
  lon: { type: Number },
  misurazioni: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Misurazione" }],
});

module.exports = mongoose.model("Stazione", stazioneSchema, "stazioni");
