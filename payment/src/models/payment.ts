import { Document, model, Model, Schema, Types } from "mongoose";

export interface IPayment {
  id: string;
  orderId: string;
  stripeId: string;
}

interface IPaymentProps {
  orderId: string;
  stripeId: string;
}

interface IPaymentModel extends Model<IPayment> {
  createPayment(attrs: IPaymentProps): Document<unknown, any, IPayment> &
    IPayment & {
      _id: Types.ObjectId;
    };
}

const paymentSchema = new Schema<IPayment, IPaymentModel>(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, required: true },
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

paymentSchema.statics.createPayment = function (prop: IPaymentProps): Document<
  unknown,
  any,
  IPayment
> &
  IPayment & {
    _id: Types.ObjectId;
  } {
  return new Payment(prop);
};

export const Payment = model<IPayment, IPaymentModel>("Payment", paymentSchema);
