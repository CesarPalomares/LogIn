const { Schema, model } = require("mongoose");

const usr = new Schema({
    correo: String,
    nombre : String, 
    password: String,
    empresa: String,
    privilegios: String,
    aplicaciones: Array
}, {
    versionKey: false
});

module.exports = model('users', usr);