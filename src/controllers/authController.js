import User, { userSchema } from "../models/User";
import {validationResult} from "express-validator"
import { nanoid } from "nanoid";
import nodemailer from 'nodemailer'


export const registerForm = (req, res, next) => {
  res.render("register", {mensajes: req.flash("mensajes")});
};
//logica de registro de usuarios
export const registerUser = async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    req.flash("mensajes", errors.array())
    return res.redirect("/register")
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) throw new Error("Ya existe este usuario");

    user = new User({ userName, email, password, tokenConfirm: nanoid() });
    await user.save();
    //nodemailer
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "81c8a60dabcea5",
        pass: "b571c5f049c9f1"
      }
    });
    await transport.sendMail({
      from: 'Sistema de CoffeeDay <coffeeDay!@system.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verifica tu cuenta de Correo", // Subject line
      text: "Haz click en el siguiente link para verificar la cuenta de CoffeeDay", // plain text body
      html: `<a href="http://localhost:3000/confirmarCuenta/${user.tokenConfirm}">Verifica tu cuenta</a>`, // html body
    });
    //user guardado en base de datos
    req.flash("mensajes", [{msg: "Revisa tu Correo Electronico y Valida tu cuenta"}])
    res.redirect("/login");
  } catch (error) {
    req.flash("mensajes", [{msg: error.message}])
    return res.redirect("/register")
  }
};
//Logica de Confirmacion de Cuenta
export const confirmarCuenta = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ tokenConfirm: token });
    if (!user) throw new Error("No existe este usuario");
    user.cuentaConfirmada = true;
    user.tokenConfirm = null;
    //usuario guardado con todos sus cambios
    await user.save();
    req.flash("mensajes", [{msg: "Cuenta Verificada! Puedes Iniciar Sesion"}])
    return res.redirect("/login")
  } catch (error) {
    req.flash("mensajes", [{msg: error.message}])
    return res.redirect("/login")
  }
};
//Formulario de Logeo
export const loginForm = (req, res, next) => {
  res.render("login", {mensajes: req.flash("mensajes")});
};
//Logica de Login
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    req.flash("mensajes", errors.array())
    return res.redirect("/login")
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) throw new Error("No existe este e-mail");
    if (!user.cuentaConfirmada) throw new Error("Cuenta no Confirmada");
    //validar Contraseña

    if (!(await user.comparePassword(password)))
      throw new Error("Contraseña Incorrecta");

    //me esta creando la sesion de usuario a traves de Passport.js 
    req.login(user, function(error){
      if(error) throw new Error("Error al crear la sesion")
      res.redirect("/");
    })
  } catch (error) {
    console.log(error);
    req.flash("mensajes", [{msg: error.message}])
    return res.redirect("/login")
  }
};

export const cerrarSesion = (req, res) => {
  req.logout(function(error){
    if (error) { return next(error); }
    res.redirect('/login');
  })
}

export default {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion
};
