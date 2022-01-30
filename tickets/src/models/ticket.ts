import { versionPlugin } from "@kz-ms-ticketing/common";
import {
  Model,
  Document,
  Schema,
  ValidatorProps,
  model,
  Types,
} from "mongoose";

export interface ITicket {
  id: string;
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

interface ITicketProps {
  title: string;
  price: number;
  userId: string;
}

interface ITicketModel extends Model<ITicket> {
  createTicket(props: ITicketProps): Document<any, any, ITicket> &
    ITicket & {
      _id: Types.ObjectId;
    };
}

const ticketSchema = new Schema<ITicket, ITicketModel>(
  {
    title: { type: String, required: [true, "Ticket Title Required"] },
    price: {
      type: Number,
      required: [true, "Ticket Price Required"],
      validate: {
        validator: (val: number): boolean => val > 0,
        message: (props: ValidatorProps): string =>
          `${props.value} is not a valid price`,
      },
    },
    userId: { type: String, required: true },
    version: { type: Number, min: 0, default: 0 },
    orderId: { type: String },
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

ticketSchema.statics.createTicket = function (props: ITicketProps): Document<
  any,
  any,
  ITicket
> &
  ITicket & {
    _id: Types.ObjectId;
  } {
  return new Ticket(props);
};

export const Ticket = model<ITicket, ITicketModel>("Ticket", ticketSchema);
