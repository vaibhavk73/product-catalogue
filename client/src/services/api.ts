
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, init);
  const result = await response.json().catch(() => null) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new ApiError(result?.message || `API request failed: ${response.status}`, response.status);
  }

  if (!result || result.success !== true || !("data" in result)) {
    throw new ApiError("The server returned an invalid response.", response.status);
  }

  return "data" in result ? result.data as T : result as T;
}

export function fetchProducts(search?: string, signal?: AbortSignal, category?: string): Promise<Product[]> {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set("search", search.trim());
  }
  if (category?.trim()) params.set("category", category.trim());

  const query = params.toString();

  return request<Product[]>(
    `/api/products${query ? `?${query}` : ""}`,
    { signal }
  );
}

export function fetchCategories(signal?: AbortSignal): Promise<string[]> {
  return request<string[]>("/api/categories", { signal });
}

export function fetchProductById(id: number, signal?: AbortSignal): Promise<Product> {
  return request<Product>(`/api/products/${id}`, { signal });
}

export interface Enquiry {
  name: string;
  email: string;
  product: string;
  message: string;
}

export function submitEnquiry(enquiry: Enquiry): Promise<{ message: string }> {
  return request<{ message: string }>("/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(enquiry),
  });
}
