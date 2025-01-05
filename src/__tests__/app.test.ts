// import { buildApp } from "../app";
// import { FastifyInstance } from "fastify";
// import sqlite3 from "better-sqlite3";
// import { availableDataPlans } from "../config/seed";
// import path from "path";
// import { CREATE_DATA_PLAN_TABLE, CREATE_SUBSCRIBERS_TABLE, CREATE_USAGE_DATA_TABLE } from "../db";

import { FastifyInstance } from "fastify";
import { buildApp } from "../app";
import { execSync } from "child_process";
import { DataPlan, PrismaClient, Subscriber } from '@prisma/client';
import { availableDataPlans } from "../config/seed";
import path from "path";
import fs from 'fs';
import FormData from 'form-data';
import { Usage } from "../types";
import { BillingReport, CycleDetails } from "../types/billing";



let app: FastifyInstance;

const mockedPrisma = new (<new () => PrismaClient>(
  PrismaClient
))() as jest.Mocked<PrismaClient>;

let authorizationHeader: string = "";

beforeAll(() => {

  // Check for the environment variable to test
  console.log("In DB url: ", process.env.DATABASE_URL);

  if (process.env.DATABASE_URL !== 'file:./test.db') {
    throw new Error("Tests must be run with DATABASE_URL=file:./test.db. Found: " + process.env.DATABASE_URL);
  } else {
    // Reset and initialize the test database
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    execSync('ts-node prisma/seed.ts', { stdio: 'inherit' });


    mockedPrisma.$connect().then(async () => {
      console.log("Connected to the database:", process.env.DATABASE_URL);

      // Clear usageData table
      await mockedPrisma.usageData.deleteMany({});
    });



    app = buildApp();

  }

});

afterAll(async () => {
  // Clean up after tests (optional step, such as disconnecting Prisma client)
  await mockedPrisma.$disconnect();
});


describe('Test for APIs can only be accessed by authenticated and authorized identities', () => {

  test("GET /plans without Authorization header should return 401 Unauthorized", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/plans",
    });

    expect(response.statusCode).toBe(401);
    const responseData = response.json();
    expect(responseData.error).toBe("Unauthorized");
  });

  test("POST /login with wrong credentials should not return a JWT token", async () => {

    const response = await app.inject({
      method: "POST",
      url: "/login",
      body: {
        user: "test",
        password: "wrongPassword"
      }
    });

    expect(response.statusCode).toBe(401);
    // Verify token is not present in the response header
    expect(response.headers.authorization).toBeUndefined();

  });

  test("POST /login with correct credentials should return a JWT token", async () => {

    const response = await app.inject({
      method: "POST",
      url: "/login",
      body: {
        user: "test",
        password: "password"
      }
    });


    expect(response.statusCode).toBe(200);

    // Verify token is present in the response header
    let authorizationHeaderResponse = response.headers.authorization as string;
    expect(authorizationHeaderResponse).toBeDefined();
    expect(authorizationHeaderResponse.startsWith("Bearer ")).toBe(true);

    // Set authorization header for subsequent tests
    authorizationHeader = authorizationHeaderResponse

    // Verify token structure
    const token = authorizationHeaderResponse.split(" ")[1];
    expect(token.split(".").length).toBe(3); // JWT tokens have 3 parts

  });
});

describe('Test for data plan endpoints', () => {
  test("GET /plans should return all available plans with information", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/plans",
      headers: {
        Authorization: authorizationHeader
      }
    });

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    responseData.data.forEach((plan: DataPlan) => {
      expect(plan.dataFreeInGb).toBeDefined();
      expect(plan.billingCycleInDays).toBeDefined();
      expect(plan.price).toBeDefined();
      expect(plan.excessChargePerMb).toBeDefined();
    });
  });

  test("GET /plans should filter by provider", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/plans",
      headers: {
        Authorization: authorizationHeader
      },
      query: { provider: "M1" },
    });

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(1);
    const expectedPlan = {
      id: "plan_5",
      provider: "M1",
      name: "7GB free every week",
      dataFreeInGb: 7,
      billingCycleInDays: 7,
      price: 10,
      excessChargePerMb: 0.012
    };

    expect(responseData.data[0]).toEqual(expectedPlan);
  });

  test("GET /plans should filter by id", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/plans",
      headers: {
        Authorization: authorizationHeader
      },
      query: { id: "plan_5" },
    });

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(1);
    const expectedPlan = {
      id: "plan_5",
      provider: "M1",
      name: "7GB free every week",
      dataFreeInGb: 7,
      billingCycleInDays: 7,
      price: 10,
      excessChargePerMb: 0.012
    };

    expect(responseData.data[0]).toEqual(expectedPlan);
  });
})

describe('Test for import daily data data CSV endpoints', () => {

  const filePath = path.join(__dirname, '../../data/usage.csv');

  test("POST /import should import daily data usage from CSV", async () => {
    // Read the file to simulate the upload
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('key', 'value');

    const response = await app.inject({
      method: "POST",
      url: "/import",
      headers: {
        Authorization: authorizationHeader,
        ...form.getHeaders(),
      },
      body: form
    });

    // Assert response status and content
    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.imported).toBe(600);
    expect(responseData.data.errors).toEqual([]);
  });



  test("POST /import should return an error message because of duplicated entries due to previous exact import", async () => {

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('key', 'value');

    const response = await app.inject({
      method: "POST",
      url: "/import",
      headers: {
        Authorization: authorizationHeader,
        ...form.getHeaders(),
      },
      body: form
    });


    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.imported).toBe(0);
    expect(responseData.data.errors.length).toEqual(600);
    expect(responseData.data.errors[0].reason).toBe("There is a unique constraint violation. Existing subscriberId and date already exist.");
  });
})

describe("Test for usage data endpoints", () => {
  test("GET /usage should return all daily data usages after imported from CSV", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/usage",
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(600);

  });

  test("GET /usage should filter by subscriber ID", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/usage",
      query: { subscriberId: "1" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(60);
    expect(responseData.data[0].subscriberId).toBe("1");
    responseData.data.forEach((usage: Usage) => {
      expect(usage.id).toBeDefined();
      expect(usage.subscriberId).toBeDefined();
      expect(usage.date).toBeDefined();
      expect(usage.usageInMb).toBeDefined();
    });
  });

  test("GET /usage should filter by subscriber ID", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/usage",
      query: { subscriberId: "1" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(60);
    expect(responseData.data[0].subscriberId).toBe("1");
  });

  test("GET /usage should filter by subscriber phone number and include phone number & plan id ", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/usage",
      query: { phoneNumber: "81111111" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(60);
    expect(responseData.data[0].subscriberId).toBe("2");
    expect(responseData.data[0].phoneNumber).toBe("81111111");
    expect(responseData.data[0].planId).toBe("plan_2");
  });
})

describe("Test for generating billing report for a specific subsriber over the last 30 days", () => {
  test("GET /billing should return the total cost of all full billing cycles incurred within that billing period, given the registered phone number", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/billing",
      query: { phoneNumber: "80000000", days: "30" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.totalCost).toBeDefined();
    expect(responseData.data.fullBillingCycles).toBe(30);
    expect(responseData.data.phoneNumber).toBe("80000000");
    expect(responseData.data.billingDetails.length).toBe(30);
    responseData.data.billingDetails.forEach((cycle: CycleDetails) => {
      expect(cycle.cycleStartDate).toBeDefined()
      expect(cycle.cycleEndDate).toBeDefined();
      expect(cycle.cycleUsageInMb).toBeDefined();
      expect(cycle.costOfBillingCycle).toBeDefined();
      expect(cycle.excessDataInMb).toBeDefined();
      expect(cycle.costOfExcessData).toBeDefined();
    });
  });

  test("GET /billing should return error message given non-registered phone number ", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/billing",
      query: { phoneNumber: "81234567" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(404);
    const responseData = response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe("No usage data found for the provided phone number.");
  });


});

describe("Test for subscribers endpoints", () => {
  test("GET /subscribers should return all subscribers with phone number and plan ID", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/subscribers",
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(10);
    responseData.data.forEach((usage: Subscriber) => {
      expect(usage.id).toBeDefined();
      expect(usage.phoneNumber).toBeDefined();
      expect(usage.planId).toBeDefined();
    });
  });

  test("GET /subscribers should correctly filter by subscriber ID", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/subscribers",
      query: { id: "1" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].phoneNumber).toBe("80000000");
    expect(responseData.data[0].planId).toBe("plan_3");
  });

  test("GET /subscribers should correctly filter by phone number", async () => {

    const response = await app.inject({
      method: "GET",
      url: "/subscribers",
      query: { phoneNumber: "80000000" },
      headers: {
        Authorization: authorizationHeader
      }
    })

    expect(response.statusCode).toBe(200);
    const responseData = response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.length).toBe(1);
    expect(responseData.data[0].phoneNumber).toBe("80000000");
    expect(responseData.data[0].planId).toBe("plan_3");
  });

})
