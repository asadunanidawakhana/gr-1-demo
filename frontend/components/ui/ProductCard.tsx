import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price?: number | null
  images: string[]
  is_best_seller?: boolean
  is_featured?: boolean
}

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  return (
    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        <div className="product-card-image">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0ece6 0%, #e8e4de 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No Image
            </div>
          )}

          {product.is_best_seller && (
            <span className="product-card-badge gold">Best Seller</span>
          )}
          {discount && (
            <span className="product-card-badge" style={{ top: product.is_best_seller ? 40 : 12 }}>
              -{discount}%
            </span>
          )}
        </div>

        <div className="product-card-body">
          <div className="product-card-name">{product.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <span className="product-card-price">Rs. {product.price.toLocaleString()}</span>
            {product.compare_price && (
              <span className="product-card-compare-price">Rs. {product.compare_price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '80%' }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '40%' }} />
      </div>
    </div>
  )
}
