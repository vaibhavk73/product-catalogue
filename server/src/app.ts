
import express from "express";
import cors from "cors";
import { z } from "zod";

import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  getProductById,
  getCategories,
  ProductNotFoundError,
} from "./integrations/product-provider";

import { sendEnquiryEmail } from "./integrations/email-provider";

const app = express();

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (Number.isInteger(trustProxyHops) && trustProxyHops >= 0) {
  app.set("trust proxy", trustProxyHops);
}

const configuredOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => callback(null, !origin || configuredOrigins.includes(origin)),
}));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(express.json({ limit: "10kb" }));

const enquiryRateLimit = new Map<string, { count: number; resetAt: number }>();
let rateLimitRequests = 0;
const ENQUIRY_WINDOW_MS = 15 * 60 * 1000;
const ENQUIRY_LIMIT = 5;

function limitEnquiries(req: express.Request, res: express.Response, next: express.NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  let entry = enquiryRateLimit.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + ENQUIRY_WINDOW_MS };
    enquiryRateLimit.set(key, entry);
  }

  entry.count += 1;
  rateLimitRequests += 1;
  if (rateLimitRequests % 500 === 0 || enquiryRateLimit.size > 10_000) {
    for (const [ip, limit] of enquiryRateLimit) {
      if (limit.resetAt <= now) enquiryRateLimit.delete(ip);
    }
    while (enquiryRateLimit.size > 10_000) {
      const oldest = enquiryRateLimit.keys().next().value;
      if (oldest === undefined) break;
      enquiryRateLimit.delete(oldest);
    }
  }

  if (entry.count > ENQUIRY_LIMIT) {
    res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
    res.status(429).json({ success: false, message: "Too many enquiries. Please try again later." });
    return;
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Product Catalogue API is running!",
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";

    if (search.length > 100 || category.length > 100) {
      res.status(400).json({ success: false, message: "Search and category must be 100 characters or fewer." });
      return;
    }

    const products = search
      ? await searchProducts(search)
      : category
        ? await getProductsByCategory(category)
      : await getProducts();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
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
  } catch (error) {
    res.status(error instanceof ProductNotFoundError ? 404 : 502).json({
      success: false,
      message: error instanceof ProductNotFoundError ? "Product not found" : "Unable to retrieve product",
    });
  }
});

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  product: z.string().trim().min(1).max(200),
  message: z.string().trim().min(5).max(2000),
});

app.post("/api/enquiries", limitEnquiries, async (req, res) => {
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
      data: { message: "Your enquiry has been sent successfully." },
    });
  } catch (error) {
    console.error("Enquiry email failed:", error);

    res.status(502).json({
      success: false,
      message: "Unable to send your enquiry. Please try again later.",
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number(error.status)
    : 500;
  const isPayloadError = status === 400 || status === 413;
  res.status(isPayloadError ? status : 500).json({
    success: false,
    message: status === 413 ? "Request body is too large." : isPayloadError ? "Invalid JSON request body." : "Internal server error.",
  });
});

export default app;
