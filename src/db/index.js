// packages
import mongoose from "mongoose";

// constant
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `MongoDB connected !! DB HOST: ${connectionInstance?.connection?.host}`
    );
  } catch (error) {
    console.log("DB Connection Error ", error);
    process.exit(1);
  }
};

export default connectDB;
