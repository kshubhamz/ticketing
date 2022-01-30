import {
  Listner,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { PAYMENT_QUEUE_GROUP_NAME } from "../../environment";
import { Order } from "../../models/orders";

export class OrderCreatedListner extends Listner<OrderCreatedEvent> {
  readonly subject = Subjects.ORDER_CREATED;
  queueGroupName: string = PAYMENT_QUEUE_GROUP_NAME;

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
    const newOrder = Order.createOrder({
      id: data.id,
      userId: data.userId,
      status: data.status,
      version: data.version,
      price: data.ticket.price,
    });
    await newOrder.save();
    message.ack();
  }
}
