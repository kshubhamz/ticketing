import {
  Listner,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { EXPIRATION_QUEUE_GROUP_NAME } from "../../environment";
import { expirationQueue } from "../../queue/expiration-queue";

export class OrderCreatedListner extends Listner<OrderCreatedEvent> {
  readonly subject = Subjects.ORDER_CREATED;
  queueGroupName: string = EXPIRATION_QUEUE_GROUP_NAME;

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
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add({ orderId: data.id }, { delay });
    message.ack();
  }
}
