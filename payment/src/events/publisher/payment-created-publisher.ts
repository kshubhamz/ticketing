import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@kz-ms-ticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
}
