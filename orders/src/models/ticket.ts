import { OrderStatus, versionPlugin } from "@kz-ms-ticketing/common";
import { Document, Model, model, Query, Schema, Types } from "mongoose";
import { Order } from "./order";

export interface ITicket {
  id: string;
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface ITicketProps {
  id: string;
  title: string;
  price: number;
}

interface ITicketModel extends Model<ITicket> {
  createTicket(
    props: ITicketProps
  ): Document<any, any, ITicket> & ITicket & { _id: Types.ObjectId };

  findByEvent(e: { id: string; version: number }): Query<
    | (Document<unknown, any, ITicket> &
        ITicket & {
          _id: Types.ObjectId;
        })
    | null,
    Document<unknown, any, ITicket> &
      ITicket & {
        _id: Types.ObjectId;
      },
    {},
    ITicket
  >;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    version: { type: Number, min: 0, default: 0 },
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

ticketSchema.plugin(versionPlugin);

ticketSchema.statics.createTicket = function (
  props: ITicketProps
): Document<any, any, ITicket> & ITicket & { _id: Types.ObjectId } {
  return new TicketAvailable({
    _id: props.id,
    price: props.price,
    title: props.title,
  });
};

ticketSchema.statics.findByEvent = function (d: {
  id: string;
  version: number;
}): Query<
  | (Document<unknown, any, ITicket> &
      ITicket & {
        _id: Types.ObjectId;
      })
  | null,
  Document<unknown, any, ITicket> &
    ITicket & {
      _id: Types.ObjectId;
    },
  {},
  ITicket
> {
  return TicketAvailable.findOne({ _id: d.id, version: d.version - 1 });
};

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.AWAITING_PAYMENT,
        OrderStatus.COMPLETED,
        OrderStatus.CREATED,
      ],
    },
  });

  return !!existingOrder;
};

export const TicketAvailable = model<ITicket, ITicketModel>(
  "TicketAvailable",
  ticketSchema
);
