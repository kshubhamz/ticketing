import { OrderCancelledEvent, OrderStatus } from "@kz-ms-ticketing/common";
import { Types } from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsClient } from "../../../nats-wrapper";
import { OrderCancelledListner } from "../order-cancelled-listner";

const setup = async () => {
  // creating instance of listner
  const listner = new OrderCancelledListner(natsClient.client);

  // creating and saving a Ticket
  const orderId = new Types.ObjectId().toHexString();
  const ticket = Ticket.createTicket({
    title: "Concert",
    price: 99,
    userId: "abcd",
  });
  ticket.set({ orderId });
  await ticket.save();

  // fake data event
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: { id: ticket.id },
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

  expect(updatedTicket!.orderId).not.toBeDefined();
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

  /*const ticketUpdatedData = JSON.parse(
    (natsClient.client.publish as jest.Mock).mock.calls[2][1]
  );
  expect(ticketUpdatedData.orderId).toEqual(data.id);*/
});
