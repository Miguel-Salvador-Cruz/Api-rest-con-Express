const debug = require("debug")("app:inicio");
const express = require("express");
const Joi = require('@hapi/joi');
const morgan = require('morgan');
const config = require("config");
const app = express();

const usuarios = [
	{id:1, nombre: "Miguel"},
	{id:2, nombre: "Wendy"},
	{id:3, nombre: "Maritza"}
];

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

if(app.get("env") === 'adevelopment'){
	app.use(morgan('tiny'));
	debug("Morgan habilitado");
}

console.log("Aplicación: " + config.get("nombre"));
console.log("DB server: " + config.get("configDB.host"));

app.get("/",(req,res) => {
	res.send("Hola mundo desde express");
});

app.get("/api/usuarios",(req,res) => {
	res.send(usuarios);
});

app.get("/api/usuarios/:id",(req,res) => {
	let usuario = buscarUsuario(req.params.id);
	if(!usuario) res.status(404).send("No se encontró el usuario");
	res.send(usuarios);
});

app.post("/api/usuarios", (req,res) => {
	const schema = Joi.object({
		nombre: Joi.string().min(3).required()
	});
	const {error, value} = validarUsuario(req.body.nombre);
	if(!error){
		const usuario = {
                id: usuarios.length + 1,
                nombre: value.nombre
        	};
        usuarios.push(usuario);
        res.send(usuario);
	}
	else{
		const mensaje = error.details[0].message;
		res.status(400).send(mensaje);
	}
});

app.put("/api/usuarios/:id", (req,res) => {
	let usuario = buscarUsuario(req.params.id);
	if(!usuario){
		res.status(404).send("No se encontró el usuario");
		return;
	}
	
        const {error, value} = validarUsuario(req.body.nombre);
        if(error){
		const mensaje = error.details[0].message;
                res.status(400).send(mensaje);
		return;
	}
	usuario.nombre = value.nombre;
	res.send(usuario);
});

app.delete("/api/usuarios/:id", (req,res) => {
	let usuario = buscarUsuario(req.params.id);
        if(!usuario){
                res.status(404).send("No se encontró el usuario");
                return;
        }

	const index = usuarios.indexOf(usuario);
	usuarios.splice(index,1);
	res.send(usuarios)
});

function buscarUsuario(id){
	return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
	const schema = Joi.object({
                nombre: Joi.string().min(3).required()
        });
	return(schema.validate({nombre:nom}));
}

var port = process.env.PORT || 3000;

app.listen(port,() => {
	console.log(`Servidor escuchando desde el puerto ${port} :D`)
});

