import express, { Router } from "express";
import { ordersRouter } from "./orders.js";
import { productsRouter } from "./products.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion
} from "../controllers/authController.js";
import {
  getAllProducts,
  addProduct,
  eliminarProducto
} from "../models/products";
import {
  getAllOrders,
  addOrder,
  eliminarOrden
} from "../models/orders.js";
import Product from "../controllers/products.js";
import { body } from "express-validator"
import verificarUser from "../middlewares/verificarUser.js";
const products = new Product();
//bloque para solucionar "__dirname is not defined"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//

// Creacion de Rutas
export const mainRouter = Router();
const groupingRouter = Router();


//Ruta principal
mainRouter.use("/", groupingRouter);

// Respuesta principal (todos los endpoints disponibles)
//HOME
mainRouter.get("/",verificarUser,(req, res, next) => {
  res.render("home");
});
//LOGIN & REGISTER
mainRouter.get("/register", registerForm);
mainRouter.post("/register",[
  body("userName", "Ingrese un nombre valido").trim().notEmpty().escape(),
  body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail(), 
  body("password", "Ingrese una contraseña de minimo 6 caracteres").trim().isLength({min: 6}).escape().custom((value, {req})=>{
    if(value !== req.body.repassword){
      throw new Error("No coinciden las contraseñas")
    } else {
      return value;
    }
  })
],registerUser);
mainRouter.get("/confirmarCuenta/:token", confirmarCuenta);
mainRouter.get("/login", loginForm);
mainRouter.post("/login",[
  body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail(),
  body("password", "Ingrese una contraseña de minimo 6 caracteres").trim().isLength({min: 6}).escape()
], loginUser);
mainRouter.get("/logout", cerrarSesion)
//CoffeeDay
mainRouter.get("/products/all",getAllProducts);
mainRouter.post("/products", addProduct);

mainRouter.get("/orders/all", getAllOrders);
mainRouter.post("/orders/", verificarUser, addOrder);
mainRouter.get("/orderAdd",verificarUser, async (req, res, next) => {
  let foundItems = await products.getAllProducts(req.query);
  res.render("orderAdd", { foundItems })
}, ordersRouter);

mainRouter.get("/orders/delete/:id", eliminarOrden)
mainRouter.get("/products/delete/:id", eliminarProducto)

//Configuracion para rutas estaticas (hbs)
mainRouter.use(express.static(__dirname + "/../../public"));
// Error 404
mainRouter.use((req, res, next) => {
  res.status(404).send("Page not found").json({ error: "Page not found" });
});
// Rutas
groupingRouter.use("/orders", verificarUser ,ordersRouter);
groupingRouter.use("/products", verificarUser ,productsRouter);
