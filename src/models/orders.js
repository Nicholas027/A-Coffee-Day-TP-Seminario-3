import mongoose from "mongoose";

import { getDate } from "../utils/date.js";

const orderSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  paidIn: {
    type: String,
    required: true,
    enum: ["Efectivo", "Tarjeta"],
  },
  products: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: [1, "Debe haber almenos 1 producto pedido"],
      },
      unitPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
});

export const Order = mongoose.model("Order", orderSchema, "orders");
//GET ALL
export const getAllOrders = async ({ dateFrom, dateTo, page = 0 }) => {
  const query = {};
  // include searchFilters to query
  if (dateFrom || dateTo) {
    query.$and = [];
    if (dateFrom) {
      query.$and.push({
        date: {
          $gte: getDate(dateFrom),
        },
      });
    }
    if (dateTo) {
      query.$and.push({
        date: {
          $lte: getDate(dateTo),
        },
      });
    }
  }

  // page = 1 results as skip(0) (really first page)
  const pageNumber = page > 0 ? +page - 1 : 0;

  return await Order.find(query)
    .lean()
    .limit(10)
    .skip(10 * pageNumber)
    .exec();
};
//GET SINGLE
export const getOrder = async (orderId) => {
  return await Order.findById(orderId).lean().exec();
};
//POST
export const addOrder = async (orderData) => {
  // preparing field 'total' for orderData
  const iva = 1.21;
  const total = orderData.products.reduce(
    (prev, curr) => prev + curr.amount * curr.unitPrice * iva,
    0
  );
  const orderDataWithTotal = { ...orderData, total };

  const orderInstance = await new Order(orderDataWithTotal);
  const result = await orderInstance.save();
  return result._id;
};
//PUT
export const updateOrder = async (orderData) => {
  const dataToUpdate = { ...orderData };
  delete dataToUpdate._id; // need to delete _id for correct update procedure

  const orderBeforeUpdateToGetUnitPrices =
    orderData.products && (await getOrder(orderData._id));

  const internalUpdateOrder = async (data) =>
    await Order.updateOne(
      {
        _id: orderData._id,
      },
      {
        "$set": data,
      },
      { upsert: false }
    ).exec();

  const result = await internalUpdateOrder(dataToUpdate);

  // updating field 'total' for updated order
  if (orderData.products) {
    const updatedOrder = await getOrder(orderData._id);
    const unitPrices = orderBeforeUpdateToGetUnitPrices.products.map(
      (product) => product.unitPrice
    );
    const names = orderBeforeUpdateToGetUnitPrices.products.map(
      (product) => product.name
    );
    updatedOrder.products = updatedOrder.products.map((product, i) => ({
      ...product,
      name: names[i],
      unitPrice: unitPrices[i],
    }));
    const total = updatedOrder.products.reduce(
      (prev, curr) => prev + curr.amount * curr.unitPrice,
      0
    );
    updatedOrder.total = total;
    await internalUpdateOrder(updatedOrder);
  }

  return result.nModified;
};
//DELETE
export const deleteOrder = async (orderId) => {
  const result = await Order.deleteOne({
    _id: orderId,
  }).exec();
  return result.deletedCount;
};

export const eliminarOrden = async (req, res) => {
  const {id} = req.params
  try {
    console.log('Delete Order')
    await Order.findByIdAndDelete(id)
    res.redirect("/orders/all")
  } catch (error) {
    console.log(error)
    res.json({error})
  }
}
