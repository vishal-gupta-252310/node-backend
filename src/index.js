// packages
import dotenv from "dotenv";

// service
import connectDB from "./db/index.js";

// to serve env
dotenv.config({
  path: "./env",
});

// to connect with db
connectDB();
