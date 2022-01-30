import {
  Listner,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { TICKET_QUEUE_GROUP_NAME } from "../../environment";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListner extends Listner<OrderCreatedEvent> {
  readonly subject = Subjects.ORDER_CREATED;
  queueGroupName: string = TICKET_QUEUE_GROUP_NAME;

  async onMessage(
    data: {
      id: string;
      userId: string;
      expiresAt: string;
      status: OrderStatus;
      version: number;
      ticket: { id: string; price: number };
    },
    message: Message
  ): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error("Ticket Not Found!!");
    }

    ticket.set({ orderId: data.id });
    const savedTicket = await ticket.save();

    // publishing ticket-updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: savedTicket.id,
      title: savedTicket.title,
      userId: savedTicket.userId,
      price: savedTicket.price,
      version: savedTicket.version,
      orderId: savedTicket.orderId,
    });

    message.ack();
  }
}
