import { IconStarFilled } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { JsonLd } from "../../components/json-ld/json-ld";
import {
  formatProductPrice,
  sampleProduct,
  sampleProductReviews,
  sampleProductSpecs,
  type Product,
  type ProductReview,
  type ProductSpec,
} from "./product-data";

const availabilityLabels = {
  "in-stock": "In stock",
  "out-of-stock": "Out of stock",
  preorder: "Available for preorder",
} as const satisfies Record<Product["availability"], string>;

/**
 * Product detail page.
 *
 * One `Product` record drives the gallery, price, and Schema.org `Product`
 * node; specs and reviews are two small sibling arrays. `aggregateRating` on
 * the JSON-LD is derived from the same reviews the page lists, so the two
 * never drift apart.
 */
export default function Page() {
  const product = sampleProduct;

  return (
    <main className="min-h-svh bg-muted/40">
      <JsonLd data={toProductJsonLd(product, sampleProductReviews)} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-96">
            <img
              src={product.imageUrl}
              alt=""
              className="aspect-square w-full rounded-xl border object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <ProductSummaryCard product={product} reviewCount={sampleProductReviews.length} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <ReviewsCard reviews={sampleProductReviews} />
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <SpecsCard specs={sampleProductSpecs} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProductSummaryCard({ product, reviewCount }: { product: Product; reviewCount: number }) {
  return (
    <Card className="gap-4 py-6">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground uppercase">{product.brand}</span>
          <h1 className="m-0 text-xl font-semibold tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2">
            <StarRating rating={product.ratingValue} />
            <span className="text-sm text-muted-foreground">
              {product.ratingValue.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        </div>

        <p className="m-0 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-semibold tracking-tight">
              {formatProductPrice(product)}
            </span>
            <Badge
              variant={product.availability === "in-stock" ? "secondary" : "outline"}
              className="w-fit"
            >
              {availabilityLabels[product.availability]}
            </Badge>
          </div>
          <Button disabled={product.availability === "out-of-stock"}>Add to cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <IconStarFilled
          key={index}
          className={
            index < rounded ? "size-3.5 text-foreground" : "size-3.5 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function SpecsCard({ specs }: { specs: readonly ProductSpec[] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="m-0 flex flex-col gap-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-baseline justify-between gap-2">
              <dt className="text-xs text-muted-foreground">{spec.label}</dt>
              <dd className="m-0 text-right text-sm font-medium">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ReviewsCard({ reviews }: { reviews: readonly ProductReview[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {reviews.map((review) => (
            <li key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium">{review.author}</span>
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <p className="m-0 mt-1 text-sm text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const availabilityUrls = {
  "in-stock": "https://schema.org/InStock",
  "out-of-stock": "https://schema.org/OutOfStock",
  preorder: "https://schema.org/PreOrder",
} as const satisfies Record<Product["availability"], string>;

/** `Product` and its reviews → Schema.org `Product`, with `aggregateRating` folded in. */
function toProductJsonLd(product: Product, reviews: readonly ProductReview[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.imageUrl,
    material: product.material,
    color: product.color,
    weight: product.weight,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: availabilityUrls[product.availability],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      datePublished: review.publishedAt,
      reviewBody: review.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
    })),
  };
}
