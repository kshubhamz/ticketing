import { OrderStatus, versionPlugin } from "@kz-ms-ticketing/common";
import { Document, model, Model, Schema, Types } from "mongoose";

export interface IOrder {
  id: string;
  version: number;
  price: number;
  userId: string;
  status: OrderStatus;
}

interface IOrderProps {
  id: string;
  version: number;
  price: number;
  userId: string;
  status: OrderStatus;
}

interface IOrderModel extends Model<IOrder> {
  createOrder(props: IOrderProps): Document<unknown, any, IOrder> &
    IOrder & {
      _id: Types.ObjectId;
    };
}

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    status: { type: String, required: true, enum: OrderStatus },
    price: { type: Number, required: true },
    version: { type: Number, required: true, default: 0, min: 0 },
    userId: { type: String, required: true },
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

orderSchema.statics.createOrder = function (props: IOrderProps): Document<
  unknown,
  any,
  IOrder
> &
  IOrder & {
    _id: Types.ObjectId;
  } {
  return new Order({
    _id: props.id,
    userId: props.userId,
    status: props.status,
    version: props.version,
    price: props.price,
  });
};

export const Order = model<IOrder, IOrderModel>("PaymentOrder", orderSchema);
