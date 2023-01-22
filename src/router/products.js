import express from "express";
import mongoose from "mongoose";
import Products from "../controllers/products.js";
import {
  CONFLICT,
  NOT_FOUND,
  MISSING_DATA,
} from "../error_management/error.js";
import errorResponse from "../utils/errorResponse.js";

export const productsRouter = express.Router();
const products = new Products();

productsRouter.get("/", (req, res) => {
  res.json({
    availableMethods: [
      "GET /all",
      "GET /all?amountAtLeast&brand&categories&page",
      "GET /:id",
      "POST",
      "PUT /:id",
      "DELETE /:id",
    ],
  });
});

productsRouter.get("/all", async (req, res) => {
  //mensajes
  const searchFilters = req.query;
  const areFiltersUsed = !!Object.keys(searchFilters).length;
  if (!areFiltersUsed) {
    console.log("GET Products - Todos los productos disponibles");
  } else {
    const usedFilters = Object.keys(searchFilters).map(
      (queryKey) => ` * ${queryKey}: ${searchFilters[queryKey]}`
    );
    console.log(`GET Products - Filtros: \n${usedFilters.join("\n")}`);
  }
  const products = new Products(req.body);
  delete products._id;
  //datos
  try {
    let foundItems = await products.getAllProducts(searchFilters);
    //console.log(foundItems);
    //res.json(foundItems);
    res.render("products", {
      foundItems: foundItems,
    });
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.get("/:id", async (req, res) => {
  //mensajes
  console.log(`GET Product id:${req.params.id}`);
  //datos
  try {
    const foundItem = await products.getProduct(req.params.id);
    if (foundItem) {
      console.log(foundItem);
      res.json(foundItem);
    } else {
      throw new Error(NOT_FOUND);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.post("/", async (req, res) => {
  //mensajes
  console.log(`POST Product`);
  //console.log(req.body);
  //datos
  try {
    if (!Object.keys(req.body).length) throw new Error(MISSING_DATA);
    const addResult = await products.addProduct({
      _id: mongoose.Types.ObjectId(req.params._id),
      ...req.body,
    });

    if (addResult) {
      console.log("Producto añadido!");
      //res.json({
        //  ok: true,
        //});
      res.redirect("/products/all");
    } else {
      throw new Error(CONFLICT);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.put("/:id", async (req, res) => {
  //mensajes
  console.log(`PUT Product id:${req.params.id}`);
  console.log(req.body);
  
  //datos
  try {
    
    if (!Object.keys(req.body).length) throw new Error(MISSING_DATA);
    const updateResult = await products.updateProduct({
      _id: req.params.id,
      ...req.body,
    });
    if (updateResult) {
      console.log("Producto actualizado!");
      res.json({
        ok: true,
      });
      
    } else {
      throw new Error(NOT_FOUND);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.delete("/:id", async (req, res) => {
  //mensajes
  console.log(`DELETE Product id:${req.params.id}`);
  //datos
  try {
    const deleteResult = await products.deleteProduct(req.params.id);
    if (deleteResult) {
      console.log("Producto eliminado");
      res.json({
        ok: true,
      });
    } else {
      throw new Error(NOT_FOUND);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

