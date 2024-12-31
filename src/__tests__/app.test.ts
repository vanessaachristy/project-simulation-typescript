import { buildApp } from "../app";
import { FastifyInstance } from "fastify";
import { availableDataPlans } from "../config/seed";

let app: FastifyInstance;

beforeAll(() => {
  app = buildApp();
});

afterAll(() => {
  app.close();
});

test("GET /plans should return all available plans", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/plans",
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ success: true, data: availableDataPlans });
});

test("GET /plans should filter by provider", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/plans",
    query: { provider: "Starhub" },
  });

  expect(response.statusCode).toBe(200);
  const responseData = response.json();
  expect(responseData.success).toBe(true);
  expect(responseData.data.length).toBe(2);
});
