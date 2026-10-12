export type UserRole = 'buyer' | 'seller' | 'admin';
export type DeliveryLocation = 'Mathira' | 'Karatina' | 'Tumutumu' | 'All';

export interface SellerInfo {
  businessName: string;
  description: string;
  location: DeliveryLocation;
  phone: string;
  verified: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  location: DeliveryLocation;
  sellerInfo?: SellerInfo;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  location: DeliveryLocation;
  images: string[];
  sellerId: string;
  sellerName: string;
  createdAt: string;
  freeDelivery: boolean;
  tags: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryLocation: DeliveryLocation;
  deliveryAddress: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
}
