import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { app } from "./app";
import { environment } from "./environment";
import { ExpirationCompleteListner } from "./events/expiration-complete-listner";
import { PaymentCreatedListner } from "./events/payment-created-listner";
import { TicketCreatedListner } from "./events/ticket-created-listner";
import { TicketUpdatedListner } from "./events/ticket-updated-listner";
import { natsClient } from "./nats-wrapper";

if (
  !process.env.DB_URL ||
  !process.env.SECRET_KEY ||
  !process.env.NATS_CLUSTER_ID ||
  !process.env.NATS_CLIENT_ID ||
  !process.env.NATS_URL
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
    // listening for ticket-created and ticket-updated
    new TicketCreatedListner(natsClient.client).listen();
    new TicketUpdatedListner(natsClient.client).listen();
    new ExpirationCompleteListner(natsClient.client).listen();
    new PaymentCreatedListner(natsClient.client).listen();

    natsClient.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());
  })
  .catch((err) => console.error(err));

mongoose
  .connect(environment.DB_URL)
  .then(() => {
    app.listen(process.env.PORT || 3000, () =>
      console.log("Orders Service Started!!")
    );
  })
  .catch((err) => {
    console.log(err);

    throw new Error("Error connecting to DB");
  });
