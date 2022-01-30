import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { app } from "./app";
import { environment } from "./environment";

if (
  !process.env.DB_URL ||
  !process.env.SALT_ROUNDS ||
  !process.env.SECRET_KEY
) {
  throw new Error("Configuration not proper");
}

console.log("starting up auth..");

mongoose
  .connect(environment.DB_URL)
  .then(() => {
    app.listen(process.env.PORT || 3000, () =>
      console.log("Auth Service Started!!")
    );
  })
  .catch((err) => {
    console.log(err);

    throw new Error("Error connecting to DB");
  });
