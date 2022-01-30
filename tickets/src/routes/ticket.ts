import {
  AuthError,
  BadReqError,
  CheckAuthenticated,
  RequestBodyValidator,
} from "@kz-ms-ticketing/common";
import { NextFunction, Request, Response, Router } from "express";
import { isValidObjectId } from "mongoose";
import { environment } from "../environment";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { ITicket, Ticket } from "../models/ticket";
import { natsClient } from "../nats-wrapper";

const ticketsRouter = Router();

ticketsRouter.post(
  "/",
  CheckAuthenticated(environment.SECRET_KEY),
  RequestBodyValidator("title", "price"),
  (req: Request, res: Response, next: NextFunction): void => {
    const { title, price }: { title: string; price: number } = req.body;

    const newTicket = Ticket.createTicket({
      title,
      price,
      userId: req.user!.id,
    });
    newTicket
      .save()
      .then((savedTicket: ITicket): void => {
        // publishing ticket-created event
        new TicketCreatedPublisher(natsClient.client)
          .publish({
            id: savedTicket.id,
            title: savedTicket.title,
            price: savedTicket.price,
            userId: savedTicket.userId,
            version: savedTicket.version,
          })
          .then()
          .catch((err) => console.error(err));

        res.status(201).send(savedTicket);
      })
      .catch(next);
  }
);

ticketsRouter.get(
  "/",
  (req: Request, res: Response, next: NextFunction): void => {
    Ticket.find({})
      .then((foundTickets: ITicket[]): void => {
        res.status(200).send(foundTickets);
      })
      .catch(next);
  }
);

ticketsRouter.get(
  "/:ticketId",
  (req: Request, res: Response, next: NextFunction): void => {
    const ticketId = req.params.ticketId;

    if (!isValidObjectId(ticketId)) {
      throw new BadReqError(`Not a valid ticket id - ${ticketId}`);
    }

    Ticket.findById(ticketId)
      .then((foundTicket: ITicket | null): void => {
        if (!foundTicket) {
          res
            .status(404)
            .send({ message: `Ticket Not Found With Id ${ticketId}` });
          return;
        }
        res.status(200).send(foundTicket);
      })
      .catch(next);
  }
);

ticketsRouter.put(
  "/:ticketId",
  CheckAuthenticated(environment.SECRET_KEY),
  RequestBodyValidator("title", "price"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = req.params.ticketId;

      if (!isValidObjectId(ticketId)) {
        throw new BadReqError(`Not a valid ticket id - ${ticketId}`);
      }

      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        res
          .status(404)
          .send({ message: `Ticket Not Found With Id ${ticketId}` });
        return;
      }

      if (ticket.userId !== req.user!.id) {
        next(new AuthError("Unauthorized to edit ticket"));
        return;
      }

      if (ticket.orderId) {
        throw new BadReqError("Cannot perform update on a reserved ticket.");
      }

      ticket.title = req.body.title;
      ticket.price = req.body.price;

      const savedTicket = await ticket.save();

      // publishing ticket-updated event
      await new TicketUpdatedPublisher(natsClient.client).publish({
        id: savedTicket.id,
        title: savedTicket.title,
        price: savedTicket.price,
        userId: savedTicket.userId,
        version: savedTicket.version,
      });

      res.send(ticket);
    } catch (err) {
      next(err);
    }
  }
);

export { ticketsRouter };
