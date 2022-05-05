const apartado1 = require('./login-indicadores');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const handlebars = require('express-handlebars');
const { helpers } = require('handlebars');



const app = express();
app.use(bodyParser.urlencoded({ extended: true }));


//HANDLEBARS
app.set("views", path.join(__dirname, "views"));

const exphbs = handlebars.create({
    extname: '.hbs',
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    defaultLayout:'main',

    //Helpers
    helpers:{
        ifEquals: function(a,b,opts){
            return (a==b);
        }
    }
});



app.engine(".hbs",exphbs.engine);
app.set("view engine", ".hbs");


require('./db')


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//usos
app.use(apartado1);


//Solo abre el puerto
app.listen(8000, () => {
    console.log('Listening on port 8000!')
});
