const { Schema, model } = require("mongoose");

const usr = new Schema({
    correo: String,
    nombre : String, 
    password: String,
    privilegios: String
}, {
    versionKey: false
});

module.exports = model('users', usr);