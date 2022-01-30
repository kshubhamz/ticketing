import {
  ITicketUpdatedEvent,
  Listner,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { ORDER_QUEUE_GROUP_NAME } from "../environment";
import { TicketAvailable } from "../models/ticket";

export class TicketUpdatedListner extends Listner<ITicketUpdatedEvent> {
  readonly subject = Subjects.TICKET_UPDATED;
  queueGroupName: string = ORDER_QUEUE_GROUP_NAME;

  async onMessage(
    data: {
      id: string;
      title: string;
      userId: string;
      price: number;
      version: number;
    },
    message: Message
  ): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = await TicketAvailable.findByEvent({ id, version });
    if (!ticket) {
      throw new Error("Ticket Not found");
    }

    ticket.set({ title, price });
    await ticket.save();
    message.ack();
  }
}
