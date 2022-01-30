import {
  ITicketUpdatedEvent,
  Publisher,
  Subjects,
} from "@kz-ms-ticketing/common";

export class TicketUpdatedPublisher extends Publisher<ITicketUpdatedEvent> {
  readonly subject = Subjects.TICKET_UPDATED;
}
