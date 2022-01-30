import {
  AuthError,
  BadReqError,
  CheckAuthenticated,
  OrderStatus,
  RequestBodyValidator,
} from "@kz-ms-ticketing/common";
import { NextFunction, Request, Response, Router } from "express";
import { environment } from "./environment";
import { PaymentCreatedPublisher } from "./events/publisher/payment-created-publisher";
import { Order } from "./models/orders";
import { Payment } from "./models/payment";
import { natsClient } from "./nats-wrapper";
import { stripe } from "./stripe";

const paymentRouter = Router();

paymentRouter.post(
  "/",
  CheckAuthenticated(environment.SECRET_KEY),
  RequestBodyValidator("token", "orderId"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, orderId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).send(`Order Not Found: ${orderId}`);
        return;
      }
      if (order.userId !== req.user!.id) {
        throw new AuthError("Not Authrorized to pay for this order.");
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadReqError("Cannot pay for cancelled order");
      }

      const charge = await stripe.charges.create({
        currency: "inr",
        amount: order.price * 100,
        source: token,
      });

      const payment = Payment.createPayment({ orderId, stripeId: charge.id });
      const savedPayment = await payment.save();

      // publishing payment event
      new PaymentCreatedPublisher(natsClient.client).publish({
        id: savedPayment.id,
        orderId: savedPayment.orderId,
        stripeId: savedPayment.orderId,
      });

      res.status(201).send({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

export { paymentRouter };
