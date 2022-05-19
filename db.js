const mongoose = require("mongoose");
const empresa = require("./modelos/empresa");
const usuario = require("./modelos/usuario");

(async() => {
    try{
        const db = await mongoose.connect("mongodb://127.0.0.1:27017/Users")
        console.log("DB connected", db.connection.name)

        //Busca si el superusuario existe (Si no, lo crea)
        superuser = await usuario.find({privilegios: "SuperUser"});

        if(superuser.length < 1){

            const s1 = new usuario({
                nombre: "root",
                password: "toor",
                empresa: "AnySolution",
                privilegios: "SuperUser"
            });
            s1.save(function(err){
                if(err) throw err;
            });

            console.log("Se ha creado un superusuario")
        }else if(superuser.length == 1){
            console.log("SuperUsuario Encontrado")
        }

        //Crea la empresa AnySolution si no existe
        var AnySolution = await empresa.find({nombre: "AnySolution"});

        if(AnySolution.length < 1){
            var e1 = new empresa({
                nombre: "AnySolution"
            });
            e1.save(function(err){
                if(err) throw err;
            });
        }

    }catch(error){
        console.log(error)
    }
})()