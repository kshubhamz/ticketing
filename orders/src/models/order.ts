import { OrderStatus, versionPlugin } from "@kz-ms-ticketing/common";
import { Model, Document, Schema, model, Types } from "mongoose";
import { ITicket } from "./ticket";

export interface IOrder {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicket;
  version: number;
}

interface IOrderProps {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicket;
}

interface IOrderModel extends Model<IOrder> {
  createOrder(
    props: IOrderProps
  ): Document<any, any, IOrder> & IOrder & { _id: Types.ObjectId };
}

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    userId: {
      type: String,
      required: [true, "userId is required for the order"],
    },
    status: { type: String, enum: OrderStatus, required: true },
    expiresAt: { type: Date },
    version: { type: Number, min: 0, default: 0 },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "TicketAvailable",
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

orderSchema.plugin(versionPlugin);

orderSchema.statics.createOrder = function (
  props: IOrderProps
): Document<any, any, IOrder> & IOrder & { _id: Types.ObjectId } {
  return new Order(props);
};

export const Order = model<IOrder, IOrderModel>("Order", orderSchema);
