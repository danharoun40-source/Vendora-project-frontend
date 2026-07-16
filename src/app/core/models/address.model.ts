export interface Address {
  _id: string;
  user: string;
  fullName: string;
  phone: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt?: string;
}
