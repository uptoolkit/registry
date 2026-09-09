/** The item the page is about, modeled on schema.org/Product. */
export type Product = {
  name: string;
  description: string;
  sku: string;
  brand: string;
  imageUrl: string;
  material: string;
  color: string;
  weight: string;
  dimensions: string;
  price: number;
  currency: string;
  availability: "in-stock" | "out-of-stock" | "preorder";
  ratingValue: number;
  reviewCount: number;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  /** ISO date, for Schema.org `datePublished`. */
  publishedAt: string;
  /** Relative display label, e.g. "3 weeks ago". */
  date: string;
  body: string;
};

export const sampleProduct: Product = {
  name: "Titanium Trail Trekking Pole",
  description:
    "A single-piece Ti-6Al-4V trekking pole engineered for high-cycle fatigue resistance. Same alloy grade we qualify for flight brackets, cold-forged instead of printed to keep the cost sane.",
  sku: "NB-TREK-TI-01",
  brand: "Northbeam Gear",
  imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80",
  material: "Titanium (Ti-6Al-4V)",
  color: "Raw titanium",
  weight: "148 g",
  dimensions: "110–130 cm, telescoping",
  price: 189,
  currency: "USD",
  availability: "in-stock",
  ratingValue: 4.7,
  reviewCount: 213,
};

export const sampleProductSpecs: readonly ProductSpec[] = [
  { label: "Material", value: "Titanium (Ti-6Al-4V)" },
  { label: "Weight", value: "148 g" },
  { label: "Length", value: "110–130 cm, telescoping" },
  { label: "Grip", value: "Cork composite" },
  { label: "Tip", value: "Carbide, field-replaceable" },
  { label: "Load rating", value: "120 kg static" },
];

export const sampleProductReviews: readonly ProductReview[] = [
  {
    id: "review-1",
    author: "Kalani R.",
    rating: 5,
    publishedAt: "2026-08-18",
    date: "3 weeks ago",
    body: "Half the weight of my old aluminum pair and hasn't bent once on scree.",
  },
  {
    id: "review-2",
    author: "Owen T.",
    rating: 5,
    publishedAt: "2026-08-05",
    date: "1 month ago",
    body: "Cork grip stays comfortable on long descents. Worth the price for the weight alone.",
  },
  {
    id: "review-3",
    author: "Ines M.",
    rating: 4,
    publishedAt: "2026-07-12",
    date: "2 months ago",
    body: "Great pole, wish the tip covers were included instead of sold separately.",
  },
];

export function formatProductPrice(product: Pick<Product, "price" | "currency">): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}
