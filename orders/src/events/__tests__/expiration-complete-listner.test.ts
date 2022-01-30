import { ExpirationCompleteEvent, OrderStatus } from "@kz-ms-ticketing/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { TicketAvailable } from "../../models/ticket";
import { natsClient } from "../../nats-wrapper";
import { ExpirationCompleteListner } from "../expiration-complete-listner";

const setup = async () => {
  const listner = new ExpirationCompleteListner(natsClient.client);

  const ticket = TicketAvailable.createTicket({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 9,
  });
  await ticket.save();

  const order = Order.createOrder({
    status: OrderStatus.CREATED,
    userId: "abcd",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = { orderId: order.id };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listner, ticket, order, data, msg };
};

it("update the order status to cancelled", async () => {
  const { listner, ticket, order, data, msg } = await setup();

  listner.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("emits an order:cancelled event", async () => {
  const { listner, ticket, order, data, msg } = await setup();

  listner.onMessage(data, msg);
  expect(natsClient.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsClient.client.publish as jest.Mock).mock.calls[1][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { listner, ticket, order, data, msg } = await setup();

  listner.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
