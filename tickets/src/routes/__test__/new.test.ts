import request from "supertest";
import { app } from "../../app";
import { natsClient } from "../../nats-wrapper";

it("has a post req handler at /api/tickets", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.statusCode).not.toEqual(404);
});

it("only accessible when signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(403);
});

it("return other than 403 with authenticated request", async () => {
  const cookie = await global.signIn();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "abcd", price: 10 });
  console.log(response.headers);

  expect(response.statusCode).not.toEqual(403);
});

it("return an error with invalid title", async () => {
  const cookie = await global.signIn();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 10 });
  expect(response.statusCode).toEqual(403);
});

it("return an error with invalid price", async () => {
  const cookie = await global.signIn();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "abcd" });
  expect(response.statusCode).toEqual(403);
});

it("creates a ticket with valid input", async () => {
  const cookie = await global.signIn();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "abcd", price: 10 })
    .expect(201);
});

it("calls publish function", async () => {
  const cookie = await global.signIn();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "abcd", price: 10 })
    .expect(201);
  expect(natsClient.client.publish).toBeCalled();
});
