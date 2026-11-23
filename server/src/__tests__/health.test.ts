
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { randomInt } from "node:crypto";

vi.mock("../integrations/product-provider", () => ({
  getProducts: vi.fn(),
  searchProducts: vi.fn(),
  getProductsByCategory: vi.fn(),
  getProductById: vi.fn(),
  getCategories: vi.fn(),
  ProductNotFoundError: class ProductNotFoundError extends Error {},
}));

vi.mock("../integrations/email-provider", () => ({
  sendEnquiryEmail: vi.fn(),
}));

import app from "../app";
import {
  getProducts,
  searchProducts,
  getProductById,
  getProductsByCategory,
  ProductNotFoundError,
} from "../integrations/product-provider";
import { sendEnquiryEmail } from "../integrations/email-provider";

const mockProduct = {
  id: 1,
  title: "Test Product",
  price: 29.99,
  description: "A test product",
  category: "electronics",
  image: "https://example.com/product.jpg",
  rating: { rate: 4.5, count: 100 },
};

const validEnquiry = {
  name: "Test Customer",
  email: "test@example.com",
  product: "Test Product",
  message: "I would like more information.",
};

describe("Product Catalogue API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/health should return 200", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("GET /api/products should return products", async () => {
    vi.mocked(getProducts).mockResolvedValue([mockProduct]);

    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([mockProduct]);
  });

  it("GET /api/products/:id should return a product", async () => {
    vi.mocked(getProductById).mockResolvedValue(mockProduct);

    const response = await request(app).get("/api/products/1");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
  });

  it("GET /api/products/:id should return 404 when the provider reports a missing product", async () => {
    vi.mocked(getProductById).mockRejectedValue(new ProductNotFoundError());
    const response = await request(app).get("/api/products/999999");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Product not found");
  });

  it("GET /api/products/:id should return 502 when the provider fails", async () => {
    vi.mocked(getProductById).mockRejectedValue(new Error("Upstream unavailable"));
    const response = await request(app).get("/api/products/1");
    expect(response.status).toBe(502);
  });

  it("should reject an invalid product ID", async () => {
    const response = await request(app).get("/api/products/abc");
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/products?search=jacket should search products", async () => {
    vi.mocked(searchProducts).mockResolvedValue([mockProduct]);

    const response = await request(app)
      .get("/api/products?search=jacket");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([mockProduct]);
    expect(searchProducts).toHaveBeenCalledWith("jacket");
  });

  it("GET /api/products?category=electronics should filter by category upstream", async () => {
    vi.mocked(getProductsByCategory).mockResolvedValue([mockProduct]);
    const response = await request(app).get("/api/products?category=electronics");
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([mockProduct]);
    expect(getProductsByCategory).toHaveBeenCalledWith("electronics");
  });

  it("should reject overly long product searches", async () => {
    const response = await request(app).get(`/api/products?search=${"a".repeat(101)}`);
    expect(response.status).toBe(400);
  });

  it("should return 502 when product provider fails", async () => {
    vi.mocked(getProducts).mockRejectedValue(
      new Error("External API unavailable")
    );

    const response = await request(app).get("/api/products");

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
  });

  it("POST /api/enquiries should reject invalid input", async () => {
    const response = await request(app)
      .post("/api/enquiries")
      .send({ name: "A", email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(sendEnquiryEmail).not.toHaveBeenCalled();
  });

  it("POST /api/enquiries should send a valid enquiry", async () => {
    vi.mocked(sendEnquiryEmail).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/enquiries")
      .send(validEnquiry);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(sendEnquiryEmail).toHaveBeenCalledWith(validEnquiry);
  });

  it("should rate limit repeated enquiry submissions", async () => {
    vi.mocked(sendEnquiryEmail).mockResolvedValue(undefined);
    const originalTrustProxy = app.get("trust proxy");
    const clientIp = `198.51.100.${randomInt(1, 255)}`;
    app.set("trust proxy", true);

    try {
      for (let attempt = 1; attempt <= 5; attempt += 1) {
        const response = await request(app)
          .post("/api/enquiries")
          .set("X-Forwarded-For", clientIp)
          .send(validEnquiry);
        expect(response.status, `request ${attempt} should be accepted`).toBe(200);
      }

      const sixthResponse = await request(app)
        .post("/api/enquiries")
        .set("X-Forwarded-For", clientIp)
        .send(validEnquiry);
      expect(sixthResponse.status).toBe(429);
      expect(sixthResponse.headers["retry-after"]).toBeDefined();
    } finally {
      app.set("trust proxy", originalTrustProxy);
    }
  });
});
