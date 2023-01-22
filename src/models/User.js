import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcryptjs";

export const userSchema = new Schema({
  userName: {
    type: "string",
    lowercase: true,
    required: true,
  },
  email: {
    type: "string",
    lowercase: true,
    required: true,
    unique: true,
    index: { unique: true },
  },
  password: {
    type: "string",
    required: true,
  },
  tokenConfirm: {
    type: "string",
    default: null,
  },
  cuentaConfirmada: {
    type: Boolean,
    default: false,
  },
});

//Logica de Mongoose para hashear la contraseña dentro de mongoDB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);

    this.password = hash;
  } catch (err) {
    throw new Error("Error al hashear la contraseña");
    next();
  }
});

userSchema.methods.comparePassword = async function (cantidatePassword) {
  return await bcrypt.compare(cantidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
