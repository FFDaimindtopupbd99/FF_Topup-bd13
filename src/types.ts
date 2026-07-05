export interface PaymentMethods {
  bkash: boolean;
  nagad: boolean;
  rocket: boolean;
  upay: boolean;
  shurjopay: boolean;
  sslcommerz: boolean;
}

export interface SupportedGames {
  freefire: boolean;
  pubg: boolean;
  clashofclans: boolean;
  mobilelegends: boolean;
}

export interface ContentPolicies {
  terms: boolean;
  privacy: boolean;
  refund: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PageAnalysis {
  title: string;
  description: string;
  keywords: string;
  isHttps: boolean;
  socialLinks: SocialLink[];
  payments: PaymentMethods;
  games: SupportedGames;
  phones: string[];
  emails: string[];
  policies: ContentPolicies;
  trustScore: number;
}

export interface CheckSiteResult {
  url: string;
  isOnline: boolean;
  latencyMs: number;
  statusCode?: number;
  error?: string;
  analysis?: PageAnalysis;
  aiReport?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface Product {
  id: string;
  name: string;
  category: "ff_uid" | "weekly_monthly" | "offers" | "others";
  price: number;
  originalPrice?: number;
  diamonds?: number;
  image?: string;
  tag?: string;
}

export interface Order {
  id: string;
  playerName: string;
  playerUid?: string;
  productName: string;
  price: number;
  quantity: number;
  status: "pending" | "processing" | "complete" | "failed";
  paymentMethod: "bkash" | "nagad" | "rocket" | "wallet";
  transactionId?: string;
  senderNumber?: string;
  timestamp: string;
  etaSeconds?: number;
  createdAt?: number;
  rating?: number;
}

export interface Deposit {
  id: string;
  paymentMethod: "bkash" | "nagad" | "rocket";
  amount: number;
  senderNumber: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  userEmail?: string;
  createdAt?: number;
}
