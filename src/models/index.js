import mongoose from "mongoose";

export const connectToMongoose = async () => {
  const url = "mongodb://localhost:27017/coffeeShop";
  await mongoose.connect(url, { useNewUrlParser: true });
  console.log("MongoDB Local (COMPASS) Connected!");
  return mongoose.connection.db;
};
export const connectToMongooseUser = async () => {
  const url = "mongodb://localhost:27017/coffeeShop";
  await mongoose.connect(url, { useNewUrlParser: true });
  console.log("MongoDB Local (COMPASS) for User Authentication Connected!");
  return mongoose.connection.db;
};
