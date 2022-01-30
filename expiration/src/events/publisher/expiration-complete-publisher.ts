import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@kz-ms-ticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.EXPIRATION_COMPLETE;
}
