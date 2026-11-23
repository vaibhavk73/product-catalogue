
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../integrations/product-provider", () => ({
  getProducts: vi.fn(),
  searchProducts: vi.fn(),
  getProductById: vi.fn(),
  getCategories: vi.fn(),
}));

vi.mock("../integrations/email-provider", () => ({
  sendEnquiryEmail: vi.fn(),
}));

import app from "../app";
import {
  getProducts,
  searchProducts,
  getProductById,
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
});
