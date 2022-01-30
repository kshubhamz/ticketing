import { JWT } from "@kz-ms-ticketing/common";
import dotenv from "dotenv";
dotenv.config();

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { environment } from "../environment";

declare global {
  var signIn: () => Promise<[string]>;
}

// mock this file with file with same name in __mocks__
jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;
beforeAll(async () => {
  jest.clearAllMocks();

  mongo = await MongoMemoryServer.create();
  const mongoUrl = mongo.getUri();

  await mongoose.connect(mongoUrl);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  collections.forEach(async (collection) => {
    await collection.deleteMany({});
  });
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signIn = async (): Promise<[string]> => {
  // creating payload
  const payload = { id: "36vvvdvd", email: "test@test.com" };
  // creating token
  const token = await JWT.createJWT(payload, environment.SECRET_KEY);
  // creating jwt object
  const jwt = { jwt: token };
  // JSON
  const jwtJSON = JSON.stringify(jwt);
  // base64
  const encodedJwt = Buffer.from(jwtJSON).toString("base64");
  // returning session
  return [`express:ses=${encodedJwt}`];
};
