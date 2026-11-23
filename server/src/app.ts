
import express from "express";
import cors from "cors";
import { z } from "zod";

import {
  getProducts,
  searchProducts,
  getProductById,
  getCategories,
} from "./integrations/product-provider";

import { sendEnquiryEmail } from "./integrations/email-provider";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Product Catalogue API is running!",
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    const products = search
      ? await searchProducts(search)
      : await getProducts();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch {
    res.status(502).json({
      success: false,
      message: "Unable to retrieve products",
    });
  }
});

app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await getCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch {
    res.status(502).json({
      success: false,
      message: "Unable to retrieve categories",
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
    return;
  }

  try {
    const product = await getProductById(id);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch {
    res.status(502).json({
      success: false,
      message: "Unable to retrieve product",
    });
  }
});

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  product: z.string().trim().min(1).max(200),
  message: z.string().trim().min(5).max(2000),
});

app.post("/api/enquiries", async (req, res) => {
  const validation = enquirySchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Please provide valid enquiry details.",
    });
    return;
  }

  try {
    await sendEnquiryEmail(validation.data);

    res.status(200).json({
      success: true,
      message: "Your enquiry has been sent successfully.",
    });
  } catch (error) {
    console.error("Enquiry email failed:", error);

    res.status(502).json({
      success: false,
      message: "Unable to send your enquiry. Please try again later.",
    });
  }
});

export default app;
