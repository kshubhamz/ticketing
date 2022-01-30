import { OrderCreatedEvent, OrderStatus } from "@kz-ms-ticketing/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-wrapper";
import { OrderCreatedListner } from "../order-created-listner";

const setup = async () => {
  // creating instance of listner
  const listner = new OrderCreatedListner(natsClient.client);

  // creating and saving a Ticket
  const ticket = Ticket.createTicket({
    title: "Concert",
    price: 99,
    userId: "abcd",
  });
  await ticket.save();

  // fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.CREATED,
    expiresAt: "abdf",
    userId: "bgfd",
    ticket: { id: ticket.id, price: ticket.price },
  };

  // Message Object
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };

  return { listner, ticket, data, msg };
};

it("sets the orderId of the ticket", async () => {
  const { listner, ticket, data, msg } = await setup();

  await listner.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listner, data, msg } = await setup();

  await listner.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket:updated event", async () => {
  const { listner, ticket, data, msg } = await setup();

  await listner.onMessage(data, msg);
  expect(natsClient.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsClient.client.publish as jest.Mock).mock.calls[2][1]
  );
  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
