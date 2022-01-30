import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import { errorHandler } from "@kz-ms-ticketing/common";
import cors from "cors";
import { ticketsRouter } from "./routes/ticket";

const app = express();
// TODO app.set('trust proxy', true); app.use(cookieSession({ signed: false, secure: true }));
app.use(express.json());
app.use(cors());
app.use(cookieSession({ signed: false }));

app.use("/api/tickets", ticketsRouter);

app.all("*", (req: Request, res: Response) => {
  res.status(404).send({ message: "Invalid endpoints" });
});

app.use(errorHandler);

export { app };
