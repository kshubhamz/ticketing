import {
  Listner,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { PAYMENT_QUEUE_GROUP_NAME } from "../../environment";
import { Order } from "../../models/orders";

export class OrderCancelledListner extends Listner<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
  queueGroupName: string = PAYMENT_QUEUE_GROUP_NAME;

  async onMessage(
    data: { id: string; version: number; ticket: { id: string } },
    message: Message
  ): Promise<void> {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order not found!!");
    }

    order.set({ status: OrderStatus.CANCELLED });
    await order.save();
    message.ack();
  }
}
