import { OrderCreatedEvent, OrderStatus } from "@kz-ms-ticketing/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/orders";
import { natsClient } from "../../../nats-wrapper";
import { OrderCreatedListner } from "../order-created-listner";

const setup = async () => {
  const listner = new OrderCreatedListner(natsClient.client);

  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    userId: "abcd",
    expiresAt: "abcd",
    status: OrderStatus.CREATED,
    version: 0,
    ticket: { id: "qwerty", price: 9 },
  };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };
  return { listner, data, msg };
};

it("replicates the order info", async () => {
  const { listner, data, msg } = await setup();
  listner.onMessage(data, msg);
  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listner, data, msg } = await setup();
  listner.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
