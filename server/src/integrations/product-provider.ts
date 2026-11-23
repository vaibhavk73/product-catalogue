import { z } from "zod";

const API_BASE_URL = "https://fakestoreapi.com";
const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;

const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().finite(),
  description: z.string(),
  category: z.string(),
  image: z.string().url(),
  rating: z.object({
    rate: z.number().finite(),
    count: z.number().int().nonnegative(),
  }),
});
const productsSchema = z.array(productSchema);
const categoriesSchema = z.array(z.string());

export type Product = z.infer<typeof productSchema>;

export class ProductNotFoundError extends Error {
  constructor() {
    super("Product not found");
    this.name = "ProductNotFoundError";
  }
}

let productsCache: { value: Product[]; expiresAt: number } | undefined;
let productsRequest: Promise<Product[]> | undefined;
let categoriesCache: { value: string[]; expiresAt: number } | undefined;

async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  emptyBodyIsNotFound = false
): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 404) throw new ProductNotFoundError();
  if (!response.ok) throw new Error(`Product provider returned ${response.status}`);

  if (emptyBodyIsNotFound) {
    const body = await response.text();
    if (!body.trim()) throw new ProductNotFoundError();
    return schema.parse(JSON.parse(body));
  }

  return schema.parse(await response.json());
}

export async function getProducts(): Promise<Product[]> {
  if (productsCache && productsCache.expiresAt > Date.now()) {
    return productsCache.value;
  }
  if (productsRequest) return productsRequest;

  productsRequest = fetchJson(`${API_BASE_URL}/products`, productsSchema)
    .then((products) => {
      productsCache = { value: products, expiresAt: Date.now() + CACHE_TTL_MS };
      return products;
    })
    .finally(() => {
      productsRequest = undefined;
    });

  return productsRequest;
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const products = await getProducts();
  const term = searchTerm.trim().toLowerCase();

  if (!term) return products;

  return products.filter((product) =>
    product.title.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.category.toLowerCase().includes(term)
  );
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return fetchJson(
    `${API_BASE_URL}/products/category/${encodeURIComponent(category)}`,
    productsSchema
  );
}

export async function getProductById(id: number): Promise<Product> {
  return fetchJson(`${API_BASE_URL}/products/${id}`, productSchema, true);
}

export async function getCategories(): Promise<string[]> {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) {
    return categoriesCache.value;
  }

  const categories = await fetchJson(
    `${API_BASE_URL}/products/categories`,
    categoriesSchema
  );
  categoriesCache = { value: categories, expiresAt: Date.now() + CACHE_TTL_MS };
  return categories;
}
