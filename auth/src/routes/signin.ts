import { NextFunction, Request, Response, Router } from "express";
import {
  BadReqError,
  RequestBodyValidator,
  Bcrypt,
  JWT,
} from "@kz-ms-ticketing/common";
import { User } from "../models/user";
import { environment } from "../environment";

const signInRouter = Router();

signInRouter.post(
  "/",
  RequestBodyValidator("email", "password"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        next(new BadReqError("Incorrect combination of email and password"));
        return;
      }

      const isPasswordValid = await Bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordValid) {
        next(new BadReqError("Incorrect combination of email and password"));
        return;
      }

      const jwt = await JWT.createJWT(
        {
          id: existingUser.id,
          email: existingUser.email,
        },
        environment.SECRET_KEY
      );

      // storing on session
      req.session = { jwt };
      res.status(200).send(existingUser);
    } catch (err) {
      next(err);
    }
  }
);

export { signInRouter };
