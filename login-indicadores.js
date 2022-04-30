const usuario = require('./modelos/usuario');

const { Router } = require("express");


const router = Router();

/* GET */
//Se entra en la pagina
router.get('/', (req, res) => {
    res.render('login');
});

router.get('/home', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        res.render('home');
    }else{
        res.redirect('/');
    }
});

router.get('/Registro', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var privilegios = user.at(0).privilegios == "Admin";
        var superuser = user.at(0).privilegios == "SuperUser";
        res.render('crearUsuario', {superuser: superuser ,privilegios: privilegios});
    }else{
        res.redirect('/');
    }
});

router.get('/Lista', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){
        var usuarios = await usuario.find().lean();

        res.render('ListaUsuarios', {test: usuarios});
    }else{
        res.redirect('/');
    }
});

router.get('/Modificar', async (req, res) => {
    var user = await usuario.find({nombre: req.session.nombre, password: req.session.password});
    
    if(user.length > 0){

        if(user.at(0).privilegios == "SuperUser"){
            var usuarios = await usuario.find({privilegios: {$nin: ["SuperUser"]}}).lean();
        }else{
            var usuarios = await usuario.find({privilegios: {$nin: ["Admin", "SuperUser"]}}).lean();
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
    if(req.body.contra1 == req.body.contra2){
        var nombre = req.body.usuario;
        var password = req.body.contra1;
        var privilegios = req.body.privilegios;
        console.log(privilegios)

        const p1 = new usuario({
            nombre: nombre,
            password: password,
            privilegios: privilegios
        });
        p1.save(function(err){
            if(err) throw err;
        });
        res.redirect('/home');
    }else{
        res.redirect('/Registro');
    }
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

    res.render('EditUsr', {nombre: nombre,password: usr.password, superuser: superuser, adm: adm, invitado: invitado});
});

router.post('/Guardar', async (req, res) => {

    if(req.body.privilegios != undefined){
        const u1 = await usuario.updateOne({nombre: req.session.usuarioMod}, {
            nombre: req.body.usuario,
            password: req.body.p1,
            privilegios: req.body.privilegios
        });
    }else{
        const u1 = await usuario.updateOne({nombre: req.session.usuarioMod}, {
            nombre: req.body.usuario,
            password: req.body.p1
        });
    }

    res.render('home');
});

router.post('/Eliminar', async (req, res) => {
    await usuario.deleteOne({nombre: req.session.usuarioMod});

    res.render('home');
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

module.exports = router;