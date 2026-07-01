export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  discountPrice?: number;
  rating: number;
  stock: number;
  description: string;
  unit?: string; // Unit description, e.g. "1 kg", "500 g", "1 L"
}
