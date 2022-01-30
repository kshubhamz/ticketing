import {
  Listner,
  OrderCancelledEvent,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { TICKET_QUEUE_GROUP_NAME } from "../../environment";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListner extends Listner<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
  queueGroupName: string = TICKET_QUEUE_GROUP_NAME;

  async onMessage(
    data: { id: string; version: number; ticket: { id: string } },
    message: Message
  ): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error("Ticket Not Found!!");
    }

    ticket.set({ orderId: undefined });
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
