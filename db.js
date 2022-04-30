const mongoose = require("mongoose");

(async() => {
    try{
    const db = await mongoose.connect("mongodb://127.0.0.1:27017/Users")
    console.log("DB connected", db.connection.name)
    }catch(error){
        console.log(error)
    }
})()