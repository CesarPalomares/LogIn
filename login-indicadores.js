const usuario = require('./modelos/usuario');
const token = require('./modelos/tokens');

const { Router } = require("express");
const nodemailer = require('nodemailer');

//Correo
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tokenatort@gmail.com',
      pass: 'tokenatort123roothelper'
    }
});


const router = Router();

/* GET */
//Se entra en la pagina
router.get('/', (req, res) => {
    res.render('login');
});

router.get('/home', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var usuarios = await usuario.find().lean();
        res.render('home', {test: usuarios, empresa: user.at(0).empresa});
    }else{
        res.redirect('/');
    }
});

router.get('/Registro', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var privilegios = user.at(0).privilegios == "Admin";
        var superuser = user.at(0).privilegios == "SuperUser";
        res.render('crearUsuario', {superuser: superuser,empresa: user.at(0).empresa ,privilegios: privilegios});
    }else{
        res.redirect('/');
    }
});

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

router.get('/Perfil', async (req, res) =>{
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var usuarios = await usuario.find({ nombre: { $ne: req.session.nombre}}).lean();
        var privilegios = user.at(0).privilegios == "Admin";

        res.render('Perfil',{usuario: req.session.nombre});
    }else{
        res.redirect('/');
    }    
});

router.get('/token', async (req, res) => {
    res.render('UsarToken');
});

router.get('/RegistroToken', async (req, res) =>{
    var n = req.session.nombreToken;
    req.session.nombreToken = undefined;

    if(n != undefined){
        res.render('RegistroConToken', {nombre: n});
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
    res.redirect('home');
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
    
        res.render('home');
    }else{
        res.redirect('/home');
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

module.exports = router;