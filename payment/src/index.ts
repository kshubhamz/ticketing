import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { app } from "./app";
import { environment } from "./environment";
import { OrderCancelledListner } from "./events/listner/order-cancelled-listner";
import { OrderCreatedListner } from "./events/listner/order-created-listner";
import { PaymentCreatedListner } from "./events/listner/payment-created-listner";
import { natsClient } from "./nats-wrapper";

if (
  !process.env.DB_URL ||
  !process.env.SECRET_KEY ||
  !process.env.NATS_CLUSTER_ID ||
  !process.env.NATS_CLIENT_ID ||
  !process.env.NATS_URL ||
  !process.env.STRIPE_KEY
) {
  throw new Error("Configuration not proper");
}

natsClient
  .connect(
    environment.NATS_CLUSTER_ID,
    environment.NATS_CLIENT_ID,
    environment.NATS_URL
  )
  .then(() => {
    natsClient.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());

    // listening
    new OrderCreatedListner(natsClient.client).listen();
    new OrderCancelledListner(natsClient.client).listen();
    new PaymentCreatedListner(natsClient.client).listen();
  })
  .catch((err) => console.error(err));

mongoose
  .connect(environment.DB_URL)
  .then(() => {
    app.listen(process.env.PORT || 3000, () =>
      console.log("Tickets Service Started!!")
    );
  })
  .catch((err) => {
    console.log(err);

    throw new Error("Error connecting to DB");
  });
