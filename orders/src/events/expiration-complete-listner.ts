import {
  ExpirationCompleteEvent,
  Listner,
  OrderStatus,
  Subjects,
} from "@kz-ms-ticketing/common";
import { Message } from "node-nats-streaming";
import { ORDER_QUEUE_GROUP_NAME } from "../environment";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "./order-cancelled-publisher";

export class ExpirationCompleteListner extends Listner<ExpirationCompleteEvent> {
  readonly subject = Subjects.EXPIRATION_COMPLETE;
  queueGroupName: string = ORDER_QUEUE_GROUP_NAME;

  async onMessage(data: { orderId: string }, message: Message): Promise<void> {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order Not Found!!");
    }

    if (order.status === OrderStatus.COMPLETED) {
      message.ack();
      return;
    }

    order.set({ status: OrderStatus.CANCELLED });
    const cancelledOrder = await (await order.save()).populate("ticket");

    // publishing order-cancelled event
    await new OrderCancelledPublisher(this.client).publish({
      id: cancelledOrder.id,
      version: cancelledOrder.version,
      ticket: { id: cancelledOrder.ticket.id },
    });

    message.ack();
  }
}
