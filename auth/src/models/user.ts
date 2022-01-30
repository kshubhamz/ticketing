import {
  Model,
  model,
  Schema,
  Document,
  ValidatorProps,
  Types,
} from "mongoose";
import { Bcrypt } from "@kz-ms-ticketing/common";
import { environment } from "../environment";

// Hydrated document of user doc
export interface IUser {
  email: string;
  password: string;
  id: string;
}

// interface that describe what it's required to create user
interface IUserProps {
  email: string;
  password: string;
}

// interface that describe user model
interface IUserModel extends Model<IUser> {
  createUser(props: IUserProps): Document<any, any, IUser> &
    IUser & {
      _id: Types.ObjectId;
    };
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string): boolean =>
          /^[a-z][a-z0-9\._-]+[@][a-z]+[.][a-z]+$/.test(value),
        message: (props: ValidatorProps): string =>
          `Not a valid email: ${props.value}`,
      },
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password")) {
    Bcrypt.hash(user["password"], parseInt(environment.SALT_ROUNDS))
      .then((hashed) => {
        user["password"] = hashed;
        return next();
      })
      .catch(next);
  } else {
    next();
  }
});

userSchema.statics.createUser = function (props: IUserProps): Document<
  any,
  any,
  IUser
> &
  IUser & {
    _id: Types.ObjectId;
  } {
  return new User(props);
};

export const User = model<IUser, IUserModel>("User", userSchema);
