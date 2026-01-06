/**
 * Sigil v2.0 Example: Product Card
 *
 * Demonstrates marketing card pattern using:
 * - Layout: GlassLayout with hover physics
 * - Lens: useLens (respects user preference)
 *
 * @example
 * ```tsx
 * import { ProductCard } from 'sigil-mark/__examples__/ProductCard';
 *
 * function ProductGrid() {
 *   return (
 *     <div className="grid grid-cols-3 gap-6">
 *       {products.map((product) => (
 *         <ProductCard
 *           key={product.id}
 *           product={product}
 *           onAddToCart={() => addToCart(product.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import React from 'react';
import { GlassLayout, useLens } from '..';

// =============================================================================
// TYPES
// =============================================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  rating?: number;
  reviews?: number;
}

export interface ProductCardProps {
  /** Product data to display */
  product: Product;
  /** Called when user clicks "Add to Cart" */
  onAddToCart?: () => void;
  /** Called when user clicks "Learn More" */
  onLearnMore?: () => void;
  /** Currency symbol */
  currency?: string;
  /** Card variant */
  variant?: 'card' | 'hero' | 'feature';
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const mockProduct: Product = {
  id: 'prod_001',
  name: 'Wireless Noise-Canceling Headphones',
  description: 'Premium audio experience with 30-hour battery life and active noise cancellation.',
  price: 299.99,
  image: 'https://example.com/headphones.jpg',
  badge: 'Best Seller',
  rating: 4.8,
  reviews: 1234,
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < fullStars ? '#fbbf24' : '#d1d5db',
              fontSize: '14px',
            }}
          >
            {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '★' : '☆'}
          </span>
        ))}
      </div>
      <span style={{ fontSize: '14px', color: '#6b7280' }}>
        ({reviews.toLocaleString()})
      </span>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '4px',
        backgroundColor: '#ef4444',
        color: '#ffffff',
        textTransform: 'uppercase',
      }}
    >
      {text}
    </span>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProductCard — Marketing card with hover physics
 *
 * Architecture:
 * - `GlassLayout` provides marketing zone context (optimistic time authority)
 * - `useLens()` returns user preference (DefaultLens by default)
 * - Hover physics: scale(1.02), translateY(-4px), shadow increase
 *
 * Zone Behavior:
 * - Marketing zone allows playful animations
 * - User can choose their preferred lens
 * - GlassLayout handles hover state automatically
 */
export function ProductCard({
  product,
  onAddToCart,
  onLearnMore,
  currency = '$',
  variant = 'card',
}: ProductCardProps) {
  const Lens = useLens();

  // Format price
  const formattedPrice = `${currency}${product.price.toFixed(2)}`;

  return (
    <GlassLayout variant={variant}>
      {/* Product Image */}
      <GlassLayout.Image src={product.image} alt={product.name}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Placeholder for image */}
          <div
            style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <span style={{ fontSize: '48px' }}>📦</span>
          </div>
          {product.badge && <Badge text={product.badge} />}
        </div>
      </GlassLayout.Image>

      {/* Product Content */}
      <GlassLayout.Content>
        <GlassLayout.Title>
          <span style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.3 }}>
            {product.name}
          </span>
        </GlassLayout.Title>

        <GlassLayout.Description>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '8px',
              lineHeight: 1.5,
            }}
          >
            {product.description}
          </p>
        </GlassLayout.Description>

        {/* Rating */}
        {product.rating && product.reviews && (
          <div style={{ marginTop: '12px' }}>
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>
        )}

        {/* Price */}
        <div
          style={{
            marginTop: '16px',
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e3a8a',
          }}
        >
          {formattedPrice}
        </div>
      </GlassLayout.Content>

      {/* Actions */}
      <GlassLayout.Actions>
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <Lens.GlassButton variant="secondary" onClick={onLearnMore}>
            Learn More
          </Lens.GlassButton>
          <Lens.GlassButton variant="primary" onClick={onAddToCart}>
            Add to Cart
          </Lens.GlassButton>
        </div>
      </GlassLayout.Actions>
    </GlassLayout>
  );
}

export default ProductCard;
