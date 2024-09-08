// package
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// app configurations like setting cors origin, handle multiple type of data from request
app.use(
  cors({
    origin: process.env.CORS_ORIGIN_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: process.env.REQ_BODY_LIMIT }));
app.use(
  express.urlencoded({ extended: true, limit: process.env.REQ_BODY_LIMIT })
);
app.use(express.static("public"));
app.use(cookieParser());

export { app };
