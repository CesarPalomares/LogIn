const {Schema, model} = require('mongoose');

const emp = new Schema({
    nombre: String,
    fondo: String,
    centro: String,
    barra: String
},{
    versionKey: false
});

module.exports = model('empresas', emp)