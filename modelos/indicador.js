const {Schema, model} = require("mongoose")

const indicadorSchema = new Schema({
  name: String,
  value: Number
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('Indicador', indicadorSchema)