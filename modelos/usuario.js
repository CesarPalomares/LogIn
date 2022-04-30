const { Schema, model } = require("mongoose");

const usr = new Schema({
    nombre : String, 
    password: String,
    privilegios: String
}, {
    versionKey: false
});

module.exports = model('users', usr);