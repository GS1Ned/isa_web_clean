export interface SectorDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const SECTOR_DEFINITIONS: SectorDefinition[] = [
  {
    id: "food",
    name: "Food and beverage",
    icon: "Utensils",
    description: "Packaged and fresh food, beverages and ingredients."
  },
  {
    id: "fashion",
    name: "Fashion and apparel",
    icon: "Shirt",
    description: "Clothing, footwear and accessories."
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "Cpu",
    description: "Consumer electronics and appliances."
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "HeartPulse",
    description: "Medical devices, pharmaceuticals and healthcare products."
  },
  {
    id: "beauty",
    name: "Beauty and personal care",
    icon: "Sparkles",
    description: "Cosmetics, personal care and hygiene products."
  },
  {
    id: "home_garden",
    name: "Home and garden",
    icon: "Home",
    description: "Home goods, garden equipment and furnishings."
  },
  {
    id: "diy",
    name: "DIY and building",
    icon: "Hammer",
    description: "DIY, construction and building materials."
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: "Car",
    description: "Automotive parts, accessories and services."
  },
  {
    id: "logistics",
    name: "Logistics and transport",
    icon: "Truck",
    description: "Logistics, warehousing and transport services."
  },
  {
    id: "pharma",
    name: "Pharmaceuticals",
    icon: "Pill",
    description: "Medicinal products and related goods."
  },
  {
    id: "toys",
    name: "Toys and leisure",
    icon: "Gamepad2",
    description: "Toys, games and leisure products."
  },
  {
    id: "general_retail",
    name: "General retail",
    icon: "ShoppingBag",
    description: "Multi-category and general retail operations."
  }
];
