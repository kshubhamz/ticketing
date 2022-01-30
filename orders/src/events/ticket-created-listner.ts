import {
  ITicketCreatedEvent,
  Listner,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { ORDER_QUEUE_GROUP_NAME } from "../environment";
import { TicketAvailable } from "../models/ticket";

export class TicketCreatedListner extends Listner<ITicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
  queueGroupName: string = ORDER_QUEUE_GROUP_NAME;

  onMessage(
    data: { id: string; title: string; userId: string; price: number },
    message: Message
  ): void {
    const { id, title, price } = data;

    const newTicket = TicketAvailable.createTicket({ id, title, price });
    newTicket
      .save()
      .then(() => {
        message.ack();
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
