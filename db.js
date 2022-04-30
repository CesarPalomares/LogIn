const mongoose = require("mongoose");
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
                privilegios: "SuperUser"
            });
            s1.save(function(err){
                if(err) throw err;
            });

            console.log("Se ha creado un superusuario")
        }else if(superuser.length == 1){
            console.log("SuperUsuario Encontrado")
        }

    }catch(error){
        console.log(error)
    }
})()