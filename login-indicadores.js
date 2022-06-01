const usuario = require('./modelos/usuario');
const token = require('./modelos/tokens');
const empresa = require('./modelos/empresa');

const { Router } = require("express");
const nodemailer = require('nodemailer');
const { updateOne } = require('./modelos/usuario');
const aplicacion = require('./modelos/aplicacion');

//Correo
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tokenatort@gmail.com',
      pass: 'bmikznxwyffojaeo'
    }
});


const router = Router();

/* GET */
//Se entra en la pagina
router.get('/', (req, res) => {
    res.render('login');
});
//Se usa

router.get('/home', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);

        var usuarios = await usuario.find().lean();
        var privilegiado = user.at(0).privilegios == "SuperUser" || user.at(0).privilegios == "Gestion";
        var admin = user.at(0).privilegios == "SuperUser" || user.at(0).privilegios == "Gestion" || user.at(0).privilegios == "Admin";
        res.render('home', {fondo: emp.fondo,barra: emp.barra,centro:emp.centro , test: usuarios, empresa: user.at(0).empresa, privilegiado: privilegiado, admin: admin});
    }else{
        res.redirect('/');
    }
});
//Se usa


router.get('/Modificar', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var empresa = user.at(0).empresa;

        if(user.at(0).privilegios == "SuperUser"){
            var usuarios = await usuario.find({privilegios: {$nin: ["SuperUser"]}}).lean();
        }else{
            var usuarios = await usuario.find({empresa: empresa, privilegios: {$nin: ["Admin", "SuperUser"]}}).lean();
        }
        
        var privilegios = user.at(0).privilegios == "Admin" || user.at(0).privilegios == "SuperUser";

        res.render('ModificarUsuario', {usuarios: usuarios, privilegios: privilegios});
    }else{
        res.redirect('/');
    }    
});
//Se usa

router.get('/Perfil', async (req, res) =>{
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var usuarios = await usuario.find({ nombre: { $ne: req.session.nombre}}).lean();
        var privilegios = user.at(0).privilegios == "Admin";

        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);
        res.render('Perfil',{usuario: req.session.nombre, fondo: emp.fondo, centro: emp.centro});
    }else{
        res.redirect('/');
    }    
});
//Se usa

router.get('/token', async (req, res) => {
    res.render('UsarToken');
});
//Se usa

router.get('/RegistroToken', async (req, res) =>{
    var n = req.session.nombreToken;
    req.session.nombreToken = undefined;

    if(n != undefined){
        res.render('RegistroConToken', {nombre: n});
    }else{
        res.redirect('/');
    }
    
});

router.get('/Empresas', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var empresas = await empresa.find().lean();
        res.render('Empresas', {empresas: empresas});
    }else{
        res.redirect('/');
    }
});
//Se usa

router.get('/CrearEmpresa', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        res.render('CrearEmpresa');
    }else{
        res.redirect('/');
    }
});
//Se usa

router.get('/userHub', async (req, res) =>{
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);
        var apps = await aplicacion.find().lean();
        res.render('userHub', {fondo: emp.fondo, centro: emp.centro, barra: emp.barra, nombre: req.session.nombre, contra: req.session.password, app: apps});
    }else{
        res.redirect('/');
    }  
});

router.get('/Ajustes', async (req, res) =>{
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);
        res.render('ajustes', {fondo: emp.fondo, centro: emp.centro, barra: emp.barra});
    }else{
        res.redirect('/');
    }  
});

router.get('/addApp', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);
        res.render('addApp', {fondo: emp.fondo, centro: emp.centro, barra: emp.barra});
    }else{
        res.redirect('/');
    } 
});


/* POST */
router.post('/', (req, res) => {
    var nombre = req.body.usuario;
    var contra = req.body.p1;
    req.session.nombre = nombre;
    req.session.password = contra;
    res.redirect('/userHub');
});

router.post('/home', (req, res) => {
    res.redirect('Registro');
});

router.post('/Registro', (req, res) => {
    //Crea y guarda el token
    var tkn = Math.floor(Math.random() * (1000000000+1000000) +1000000).toString();
    var t1 = new token({
        nombre: req.body.usuario,
        empresa: req.body.empresa,
        token: tkn,
        correo: req.body.correo,
        privilegios: req.body.privilegios
    });
    t1.save();

    //Manda token por correo
    var mailOptions = {
        from: 'tokenatort@gmail.com',
        to: req.body.correo,
        subject: 'Auth Tocken',
        text: tkn
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.redirect('/home');
});

router.post('/Modificar', async (req, res) => {
    var nombre = req.body.valor;
    var usr = (await usuario.find({nombre: nombre})).at(0);
    var privilegios = usr.privilegios;
    req.session.usuarioMod = nombre;

    var u = (await usuario.find({nombre: req.session.nombre})).at(0);
    var superuser = u.privilegios == "SuperUser";

    var adm = privilegios == "Admin";
    var invitado = privilegios == "Invitado";

    res.render('EditUsr', {nombre: nombre,correo: usr.correo, superuser: superuser, adm: adm, invitado: invitado});
});

router.post('/Guardar', async (req, res) => {

    if(req.body.privilegios != undefined){
        const u1 = await usuario.updateOne({nombre: req.session.usuarioMod}, {
            correo : req.body.correo,
            nombre: req.body.usuario,
            empresa: req.body.empresa,
            privilegios: req.body.privilegios
        });
    }else{
        const u1 = await usuario.updateOne({nombre: req.session.usuarioMod}, {
            correo : req.body.correo,
            nombre: req.body.usuario,
            password: req.body.p1,
            empresa: req.body.empresa
        });
    }

    res.redirect('/home');
});

router.post('/Eliminar', async (req, res) => {
    await usuario.deleteOne({nombre: req.session.usuarioMod});

    res.redirect('/home');
});

router.post('/Perfil', async (req, res) =>{
    if(req.body.password1 == req.body.password1){
        const u1 = await usuario.updateOne({nombre: req.session.nombre}, {
            nombre: req.body.usuario,
            password: req.body.password1
        });
    
        res.redirect('/home')
    }else{
        res.redirect('/Perfil');
    }
    
});

router.post('/RegistroToken', async (req, res) =>{
    var persona = (await token.find({token: req.body.token})).at(0);

    if(persona != undefined){
        req.session.nombreToken = persona.nombre;
        res.redirect('/RegistroToken');
    }else{
        res.redirect('/token');
    }
});

router.post('/introducirUser', async (req, res) =>{
    if(req.body.p1 == req.body.p2){
        //Encuentra el tocken con los datos del usuario
        var t1 = (await token.find({nombre: req.body.nombre})).at(0);

        //Crear usuario definitivo
        var u1 = new usuario({
            correo: t1.correo,
            nombre: req.body.nombre,
            password: req.body.p1,
            empresa: t1.empresa,
            privilegios: t1.privilegios
        });
        u1.save();

        //Elimina token
        await token.deleteOne({nombre: req.body.nombre});

        res.redirect('/');
    }else{
        res.redirect('/token')
    }
});

router.post('/CrearEmpresa', async (req, res) => {
    var emp = new empresa({
        nombre: req.body.nombre
    })

    emp.save();
    res.redirect('/Empresas')
});

router.post('/Usuarios', async (req, res) => {
    var personas = await usuario.find({empresa: req.body.empresa}).lean();

    res.render('ListaUsuarios', {usuarios: personas, empresa: req.body.empresa});
});

router.post('/Registroo', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var gestion = user.at(0).privilegios == "SuperUser" || user.at(0).privilegios == "Gestion";
        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);
        res.render('crearUsuario', {fondo: emp.fondo, centro: emp.centro, empresa: req.body.empresa, gestion: gestion});
    }else{
        res.redirect('/');
    }
});

router.post('/color', async (req, res) =>{
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password}).lean();

    var emp = await empresa.updateOne({nombre: user.at(0).empresa}, {
        fondo: req.body.fondo,
        centro: req.body.centro,
        barra: req.body.barra
    });

    console.log(req.body.fondo);
    res.redirect('/Ajustes');
});

router.post('/addApp', async (req, res) => {

    var app = new aplicacion({
        nombre: req.body.nombre,
        direccion: req.body.enlace+"Login"
    });
    app.save();

    res.redirect('/userHub');
});

router.post('/modificarApp', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var emp = (await empresa.find({nombre: user.at(0).empresa})).at(0);
        var app = (await aplicacion.find({nombre: req.body.nombre})).at(0);
        res.render('modificarApp', {fondo: emp.fondo, centro: emp.centro, nombre: app.nombre, direccion: app.direccion});
    }else{
        res.redirect('/');
    }
});

router.post('/modificarGuardarApp', async (req, res) => {
    await aplicacion.updateOne({nombre: req.body.nombreInicial},{
        nombre: req.body.nombre,
        direccion: req.body.enlace
    });

    res.redirect('/userHub');
});

router.post('/eliminarApp', async (req, res) => {
    await aplicacion.deleteOne({nombre: req.body.nombre});

    res.redirect('/userHub');
});

module.exports = router;