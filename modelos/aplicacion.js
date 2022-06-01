const {Schema, model} = require('mongoose');

const aplicacion = new Schema({
    nombre: String,
    direccion: String
},{
    versionKey: false
});

module.exports = model('aplicaciones', aplicacion)