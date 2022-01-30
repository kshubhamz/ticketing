import {
  ITicketCreatedEvent,
  Publisher,
  Subjects,
} from "@kz-ms-ticketing/common";

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  readonly subject = Subjects.TICKET_CREATED;
}
