import Queue from "bull";
import { environment } from "../environment";
import { ExpirationCompletePublisher } from "../events/publisher/expiration-complete-publisher";
import { natsClient } from "../nats-wrapper";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: { host: environment.REDIS_HOST },
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsClient.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
