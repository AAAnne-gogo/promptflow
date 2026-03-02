export type ItemType =
  | "flight"
  | "hotel"
  | "restaurant"
  | "shop"
  | "attraction"
  | "transport"
  | "note";

export type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "shopping"
  | "attraction"
  | "other";

// Metadata types for each item type
export interface FlightMetadata {
  flightNo: string;
  airline?: string;
  departAirport: string;
  arriveAirport: string;
  seat?: string;
  bookingRef?: string;
}

export interface HotelMetadata {
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm
  roomType?: string;
  confirmNo?: string;
  rating?: number;
}

export interface RestaurantMetadata {
  dishes?: string[];
  rating?: number;
  priceRange?: string;
  cuisine?: string;
}

export interface ShopMetadata {
  items?: string[];
  openHours?: string;
}

export interface AttractionMetadata {
  ticketPrice?: number;
  duration?: string;
  openHours?: string;
  tips?: string;
}

export interface TransportMetadata {
  mode: string; // 地铁、出租车、巴士、火车等
  from?: string;
  to?: string;
}

export type ItemMetadata =
  | FlightMetadata
  | HotelMetadata
  | RestaurantMetadata
  | ShopMetadata
  | AttractionMetadata
  | TransportMetadata
  | null;

// Item type display config
export const ITEM_TYPE_CONFIG: Record<
  ItemType,
  { label: string; emoji: string; color: string }
> = {
  flight: { label: "航班", emoji: "✈️", color: "bg-blue-100 text-blue-800" },
  hotel: { label: "酒店", emoji: "🏨", color: "bg-purple-100 text-purple-800" },
  restaurant: {
    label: "餐厅",
    emoji: "🍜",
    color: "bg-orange-100 text-orange-800",
  },
  shop: { label: "购物", emoji: "🛍️", color: "bg-pink-100 text-pink-800" },
  attraction: {
    label: "景点",
    emoji: "🎯",
    color: "bg-green-100 text-green-800",
  },
  transport: {
    label: "交通",
    emoji: "🚗",
    color: "bg-yellow-100 text-yellow-800",
  },
  note: { label: "备注", emoji: "📝", color: "bg-gray-100 text-gray-800" },
};

export const EXPENSE_CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string }
> = {
  transport: { label: "交通", emoji: "🚗", color: "#3b82f6" },
  accommodation: { label: "住宿", emoji: "🏨", color: "#8b5cf6" },
  food: { label: "餐饮", emoji: "🍜", color: "#f97316" },
  shopping: { label: "购物", emoji: "🛍️", color: "#ec4899" },
  attraction: { label: "景点", emoji: "🎯", color: "#22c55e" },
  other: { label: "其他", emoji: "📦", color: "#6b7280" },
};
