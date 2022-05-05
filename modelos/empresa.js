const {Schema, model} = require('mongoose');

const emp = new Schema({
    nombre: String
},{
    versionKey: false
});

module.exports = model('empresas', emp)