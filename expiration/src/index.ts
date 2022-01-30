import dotenv from "dotenv";
dotenv.config();

import { environment } from "./environment";
import { OrderCreatedListner } from "./events/listner/order-created-listner";
import { natsClient } from "./nats-wrapper";

if (
  !process.env.NATS_CLUSTER_ID ||
  !process.env.NATS_CLIENT_ID ||
  !process.env.NATS_URL ||
  !process.env.REDIS_HOST
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
    new OrderCreatedListner(natsClient.client).listen();
    natsClient.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => natsClient.client.close());
    process.on("SIGTERM", () => natsClient.client.close());
  })
  .catch((err) => console.error(err));
