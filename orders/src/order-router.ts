import {
  AuthError,
  BadReqError,
  CheckAuthenticated,
  OrderStatus,
  RequestBodyValidator,
} from "@kz-ms-ticketing/common";
import { NextFunction, Request, Response, Router } from "express";
import { isValidObjectId } from "mongoose";
import { environment } from "./environment";
import { OrderCancelledPublisher } from "./events/order-cancelled-publisher";
import { OrderCreatedPublisher } from "./events/order-created-publisher";
import { IOrder, Order } from "./models/order";
import { TicketAvailable } from "./models/ticket";
import { natsClient } from "./nats-wrapper";

const orderRouter = Router();
const EXPIRE_WINDOW_TIMEOUT = 1 * 60;

orderRouter.post(
  "/",
  CheckAuthenticated(environment.SECRET_KEY),
  RequestBodyValidator("ticketId"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId: string = req.body.ticketId;

      // validate ticketId
      if (!isValidObjectId(ticketId)) {
        next(new BadReqError("Ticket ID is not valid"));
        return;
      }

      // searching ticket
      const ticket = await TicketAvailable.findById(ticketId);
      if (!ticket) {
        res
          .status(404)
          .send({ message: `Ticket is not available with id ${ticketId}` });
        return;
      }

      // ticket already reserved check
      const isReserved = await ticket.isReserved();
      if (isReserved) {
        next(new BadReqError(`${ticket.title} is already reserved.`));
        return;
      }

      // expiration date calculation
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRE_WINDOW_TIMEOUT);

      // create order
      const newOrder = Order.createOrder({
        userId: req.user!.id,
        status: OrderStatus.CREATED,
        expiresAt,
        ticket,
      });
      const savedOrder = await newOrder.save();

      // publishing event
      new OrderCreatedPublisher(natsClient.client).publish({
        id: savedOrder.id,
        userId: savedOrder.userId,
        expiresAt: savedOrder.expiresAt.toISOString(),
        status: savedOrder.status,
        version: savedOrder.version,
        ticket: { id: ticketId, price: ticket.price },
      });

      res.status(201).send(await savedOrder.populate("ticket"));
    } catch (err) {
      next(err);
    }
  }
);

orderRouter.get(
  "/",
  CheckAuthenticated(environment.SECRET_KEY),
  (req: Request, res: Response, next: NextFunction): void => {
    Order.find({ userId: req.user!.id })
      .populate("ticket")
      .exec()
      .then((orders: IOrder[]): void => {
        res.send(orders);
      })
      .catch(next);
  }
);

orderRouter.get(
  "/:orderId",
  CheckAuthenticated(environment.SECRET_KEY),
  (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;
    if (!isValidObjectId(orderId)) {
      throw new BadReqError(`Not a valid Order ID ${orderId}`);
    }

    Order.findById(orderId)
      .populate("ticket")
      .exec()
      .then((foundOrder: IOrder | null): void => {
        if (!foundOrder) {
          res
            .status(404)
            .send({ message: `No Order exist with ID ${orderId}` });
          return;
        }

        if (foundOrder.userId !== req.user!.id) {
          next(new AuthError(`Not Authorized to view this Order Details.`));
          return;
        }

        res.send(foundOrder);
      })
      .catch(next);
  }
);

orderRouter.patch(
  "/:orderId",
  CheckAuthenticated(environment.SECRET_KEY),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.orderId;
      if (!isValidObjectId(orderId)) {
        throw new BadReqError(`Not a valid Order ID ${orderId}`);
      }

      const foundOrder = await Order.findById(orderId)
        .populate("ticket")
        .exec();
      if (!foundOrder) {
        res.status(404).send({ message: `No Order exist with ID ${orderId}` });
        return;
      }
      if (foundOrder.userId !== req.user!.id) {
        throw new AuthError(`Not Authorized to update this Order Details.`);
      }

      foundOrder.status = OrderStatus.CANCELLED;
      const updatedOrder = await foundOrder.save();

      // publishing event
      new OrderCancelledPublisher(natsClient.client).publish({
        id: updatedOrder.id,
        version: updatedOrder.version,
        ticket: { id: updatedOrder.ticket.id },
      });

      res.send(updatedOrder);
    } catch (err) {
      next(err);
    }
  }
);

export { orderRouter };
