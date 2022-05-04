const { Schema, model } = require("mongoose");

const token = new Schema({
    nombre: String,
    token: String,
    correo: String,
    privilegios: String
}, {
    versionKey: false
});

module.exports = model('token', token);