import request from "supertest";
import { app } from "../../app";

it("successful signup returns 201", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);
});

it("Invalid email returns 500", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test", password: "password" })
    .expect(500);
});

it("Invalid body returns 403", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com" })
    .expect(403);

  await request(app)
    .post("/api/users/signup")
    .send({ password: "password" })
    .expect(403);

  await request(app).post("/api/users/signup").send({}).expect(403);
});

it("disallows duplicate email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(500);
});

it("sets a cookie on successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
