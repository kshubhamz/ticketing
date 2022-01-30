import dotenv from "dotenv";
dotenv.config();

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

jest.mock("../environment");

let mongo: MongoMemoryServer;
beforeAll(async () => {
  jest.setTimeout(30 * 1000);
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
