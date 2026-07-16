export interface Review {
  _id: string;
  user: { _id: string; firstName: string; lastName: string } | string;
  product: { _id: string; name: string; price: number } | string;
  rating: number;
  comment: string;
  createdAt: string;
}
