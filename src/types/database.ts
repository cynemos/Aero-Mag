export interface Magazine {
  id: string;
  title: string;
  issue_number: string;
  publication_date: string;
  price: number;
  description: string | null;
  cover_image_url: string | null;
  keywords: string[] | null;
  stock_status: 'available' | 'out_of_stock';
  has_plan: boolean;
  plan_model_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  magazine_id: string;
  quantity: number;
  price_at_time: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  magazine_id: string;
  quantity: number;
  created_at: string;
  magazine?: Magazine;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  is_admin_message: boolean;
  read: boolean;
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}
