export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  averageRating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  status: string;
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  count: number;
  data: Product[];
}
