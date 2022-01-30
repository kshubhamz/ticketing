export const environment = {
  NATS_CLUSTER_ID: process.env
    .NATS_CLUSTER_ID!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
  NATS_CLIENT_ID: process.env
    .NATS_CLIENT_ID!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
  NATS_URL: process.env.NATS_URL!.replace("-m ", "").replace(/^\s+|\s+$/g, ""),
  REDIS_HOST: process.env
    .REDIS_HOST!.replace("-m", "")
    .replace(/^\s+|\s+$/g, ""),
};

export const EXPIRATION_QUEUE_GROUP_NAME = "expiration-service";
