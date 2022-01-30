import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import { currentUserRouter } from "./routes/current-user";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "@kz-ms-ticketing/common";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import cors from "cors";

const app = express();
// TODO app.set('trust proxy', true); app.use(cookieSession({ signed: false, secure: true }));
app.use(express.json());
app.use(cors());
app.use(cookieSession({ signed: false }));

app.use("/api/users/currentUser", currentUserRouter);
app.use("/api/users/signup", signUpRouter);
app.use("/api/users/signin", signInRouter);
app.use("/api/users/signout", signOutRouter);

app.get("/", (req: Request, res: Response): void => {
  res.send("Hi there! ");
});

app.use(errorHandler);

export { app };
