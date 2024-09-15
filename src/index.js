// packages
import dotenv from "dotenv";

// service
import connectDB from "./db/index.js";
import { app } from "./app.js";

// to serve env
dotenv.config({
  path: "./.env"
});

// to connect with db
connectDB()
  .then(() => {
    app.on("error", () => {
      console.error("Something get wrong !");
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Connection Error: ", error);
  });
