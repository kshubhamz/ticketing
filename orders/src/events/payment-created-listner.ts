import {
  Listner,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { ORDER_QUEUE_GROUP_NAME } from "../environment";
import { Order } from "../models/order";

export class PaymentCreatedListner extends Listner<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
  queueGroupName: string = ORDER_QUEUE_GROUP_NAME;

  async onMessage(
    data: { id: string; orderId: string; stripeId: string },
    message: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order Not Found!!");
    }

    order.set({ status: OrderStatus.COMPLETED });
    await order.save();
    message.ack();
  }
}
