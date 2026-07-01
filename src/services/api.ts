import type { Product } from '../types/product';
import type { Category } from '../types/category';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface ProductFilterParams {
  category?: string;
  search?: string;
  deals?: boolean;
  ordering?: string;
}

/**
 * Helper adapter to transform DRF string numeric fields into standard JavaScript numbers.
 */
function adaptProduct(p: any): Product {
  return {
    ...p,
    price: Number(p.price),
    discountPrice: p.discountPrice !== null && p.discountPrice !== undefined && p.discountPrice !== ''
      ? Number(p.discountPrice)
      : undefined,
    rating: Number(p.rating)
  };
}

/**
 * Fetch product categories from the Django backend.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch products from the Django backend, supporting optional search, category filters, and sorting.
 */
export async function getProducts(params?: ProductFilterParams): Promise<Product[]> {
  const url = new URL(`${API_BASE_URL}/products/`);
  
  if (params) {
    if (params.category && params.category !== 'all') {
      url.searchParams.append('category', params.category);
    }
    if (params.search) {
      url.searchParams.append('search', params.search);
    }
    if (params.deals) {
      url.searchParams.append('deals', 'true');
    }
    if (params.ordering) {
      // Map frontend sorting names to backend ordering fields
      if (params.ordering === 'price-low') {
        url.searchParams.append('ordering', 'price');
      } else if (params.ordering === 'price-high') {
        url.searchParams.append('ordering', '-price');
      } else if (params.ordering === 'rating') {
        url.searchParams.append('ordering', 'rating');
      } else {
        url.searchParams.append('ordering', params.ordering);
      }
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  const data = await response.json();
  return data.map(adaptProduct);
}

/**
 * Fetch a single product's details by ID from the Django backend.
 */
export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product detail: ${response.statusText}`);
  }
  const data = await response.json();
  return adaptProduct(data);
}
