export const environment = {
  DB_URL: process.env.DB_URL!.replace("-m ", "").replace(/^\s+|\s+$/g, ""),
  SECRET_KEY: process.env
    .SECRET_KEY!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
  NATS_CLUSTER_ID: process.env
    .NATS_CLUSTER_ID!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
  NATS_CLIENT_ID: process.env
    .NATS_CLIENT_ID!.replace("-m ", "")
    .replace(/^\s+|\s+$/g, ""),
  NATS_URL: process.env.NATS_URL!.replace("-m ", "").replace(/^\s+|\s+$/g, ""),
};
export const TICKET_QUEUE_GROUP_NAME = "tickets-service";
