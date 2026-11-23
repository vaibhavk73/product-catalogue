import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../integrations/email-provider", () => ({
  sendEnquiryEmail: vi.fn(),
}));

import app from "../app";

const product = {
  id: 1,
  title: "Test Product",
  price: 29.99,
  description: "A test product",
  category: "electronics",
  image: "https://example.com/product.jpg",
  rating: { rate: 4.5, count: 100 },
};

const fetchMock = vi.fn();

describe("product provider not-found handling", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 for a valid product response", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(product), { status: 200 }));

    const response = await request(app).get("/api/products/1");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(product);
  });

  it("returns 404 when a product response is empty with status 200", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const response = await request(app).get("/api/products/999999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Product not found");
  });

  it("returns 404 when the upstream responds with HTTP 404", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    const response = await request(app).get("/api/products/999999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Product not found",
    });
  });

  it.each([
    ["network failure", () => Promise.reject(new Error("Network unavailable"))],
    ["upstream server failure", () => Promise.resolve(new Response("unavailable", { status: 503 }))],
    ["malformed product JSON", () => Promise.resolve(new Response("{", { status: 200 }))],
  ])("returns 502 for %s", async (_description, makeResponse) => {
    fetchMock.mockImplementation(makeResponse);

    const response = await request(app).get("/api/products/1");

    expect(response.status).toBe(502);
  });

  it("does not classify empty catalogue or category responses as product-not-found", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const catalogueResponse = await request(app).get("/api/products");
    const categoryResponse = await request(app).get("/api/categories");

    expect(catalogueResponse.status).toBe(502);
    expect(categoryResponse.status).toBe(502);
  });
});
