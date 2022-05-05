const { Schema, model } = require("mongoose");

const token = new Schema({
    nombre: String,
    empresa: String,
    token: String,
    correo: String,
    privilegios: String
}, {
    versionKey: false
});

module.exports = model('token', token);