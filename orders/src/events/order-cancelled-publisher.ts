import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@kz-ms-ticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
}
