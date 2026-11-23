
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
  data: T;
}

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  return result.data;
}

export function fetchProducts(search?: string): Promise<Product[]> {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  return request<Product[]>(
    `/api/products${query ? `?${query}` : ""}`
  );
}

export function fetchCategories(): Promise<string[]> {
  return request<string[]>("/api/categories");
}

export function fetchProductById(id: number): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}
