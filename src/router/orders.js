import express from "express";
import Orders from "../controllers/orders.js";
import mongoose from "mongoose";
import {
  CONFLICT,
  NOT_FOUND,
  MISSING_DATA,
} from "../error_management/error.js";
import errorResponse from "../utils/errorResponse.js";
import Products from "../controllers/products.js";
const products = new Products();
export const productsRouterAdd = express.Router();

const orders = new Orders();

export const ordersRouter = express.Router();

//Controlador de respuesta principal


ordersRouter.get("/all", async (req, res) => {
  //mensajes
  const searchFilters = req.query;
  const areFiltersUsed = !!Object.keys(searchFilters).length;
  if (!areFiltersUsed) {
    console.log("GET Orders - All available orders");
  } else {
    const usedFilters = Object.keys(searchFilters).map(
      (queryKey) => ` * ${queryKey}: ${searchFilters[queryKey]}`
    );
    console.log(`GET Orders - Used filters: \n${usedFilters.join("\n")}`);
  }
  //datos
  try {
    const foundItems = await orders.getAllOrders(searchFilters);
    //console.log(JSON.stringify(foundItems, undefined, 2));
    //res.json(foundItems);
    res.render("orders", { foundItems });
  } catch (err) {
    errorResponse(err, res);
  }
});

ordersRouter.get("/:id", async (req, res) => {
  //mensajes
  console.log(`GET Order id:${req.params.id}`);
  //datos
  try {
    const foundItem = await orders.getOrder(req.params.id);
    if (foundItem) {
      console.log(JSON.stringify(foundItem, undefined, 2));
      res.json(foundItem);
    } else {
      throw new Error(NOT_FOUND);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

ordersRouter.post("/", async (req, res) => {
  //mensajes
  console.log(`POST Order`);
  console.log(req.body);
  //datos
  try {
    if (!Object.keys(req.body).length) throw new Error(MISSING_DATA);
    const addResult = await orders.addOrder({
      _id: req.params._id,
      ...req.body,
    });
    console.log("Id Orden: " + addResult + " - Orden Añadida!")
  } catch (err) {
    res.json(err)
  }
  res.redirect("/orders/all")
});

ordersRouter.put("/:id", async (req, res) => {
  //mensajes
  console.log(`PUT Order id:${req.params.id}`);
  console.log(req.body);
  //datos
  try {
    if (!Object.keys(req.body).length) throw new Error(MISSING_DATA);
    const updateResult = await orders.updateOrder({
      _id: req.params.id,
      ...req.body,
    });
    if (updateResult) {
      console.log("Orden actualizada!");
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

ordersRouter.delete("/:id", async (req, res) => {
  //mensajes
  console.log(`DELETE Order id:${req.params.id}`);
  //datos
  try {
    const deleteResult = await orders.delete(req.params.id);
    if (deleteResult) {
      console.log("Orden eliminada!");
      res.json({
        ok: true,
      });
      res.redirect("/orders/all")
    } else {
      throw new Error(NOT_FOUND);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});
