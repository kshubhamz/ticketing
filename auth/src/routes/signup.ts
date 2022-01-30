import { NextFunction, Request, Response, Router } from "express";
import { RequestBodyValidator, JWT } from "@kz-ms-ticketing/common";
import { IUser, User } from "../models/user";
import { environment } from "../environment";

const signUpRouter = Router();

signUpRouter.post(
  "/",
  RequestBodyValidator("email", "password"),
  (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    const newUser = User.createUser({ email, password });

    newUser
      .save()
      .then((savedUser: IUser): void => {
        JWT.createJWT(
          { id: savedUser.id, email: savedUser.email },
          environment.SECRET_KEY
        )
          .then((jwt: string): void => {
            // storing on session
            req.session = { jwt };
            res.status(201).send(savedUser);
          })
          .catch(next);
      })
      .catch(next);
  }
);

export { signUpRouter };
