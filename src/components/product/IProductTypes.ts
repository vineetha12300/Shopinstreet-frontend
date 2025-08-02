export interface PricingTier {
    id: number;
    moq: number;
    price: number;
  }
  
  export interface Product {
    name: string;
    description: string;
    category: string;
    image_urls: string[];
    price: number;
    stock : number;
    id: number;
    vendor_id: number;
    created_at: string;
    pricing_tiers: PricingTier[];
  }
  