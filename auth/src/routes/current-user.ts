import express, { Request, Response } from "express";
import { User } from "../models/user";
import { JWT } from "@kz-ms-ticketing/common";
import { environment } from "../environment";

const currentUserRouter = express.Router();

currentUserRouter.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.session?.jwt) {
        res.send({ currentUser: null });
        return;
      }

      const payload = await JWT.verifyToken(
        req.session.jwt,
        environment.SECRET_KEY
      );

      const id = payload["id"];
      const currentUser = await User.findById(id);

      if (!currentUser) {
        res.send({ currentUser: null });
        return;
      }

      res.status(200).send({ currentUser });
    } catch (err) {
      res.send({ currentUser: null });
    }
  }
);

export { currentUserRouter };
