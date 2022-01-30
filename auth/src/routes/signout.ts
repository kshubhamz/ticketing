import { Request, Response, Router } from "express";

const signOutRouter = Router();

signOutRouter.post("/", (req: Request, res: Response): void => {
  req.session = null;
  res.status(200).send({});
});

export { signOutRouter };
