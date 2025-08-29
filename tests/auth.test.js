import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";

describe("Auth API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "password123",
      organization: "TestOrg",
      name: "Test User",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("testuser@example.com");
  }, 15000);

  it("should not register duplicate user", async () => {
    await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "password123",
      organization: "TestOrg",
      name: "Test User",
    });
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "password123",
      organization: "TestOrg",
      name: "Test User",
    });
    expect(res.statusCode).toBe(409);
  }, 15000);

  it("should login a user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("testuser@example.com");
  }, 15000);
});
