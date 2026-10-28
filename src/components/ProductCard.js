import Link from 'next/link';
import { formatPrice, getTotalStock, getStockStatus, getProductImage } from '@/lib/utils';

export default function ProductCard({ product, className = '' }) {
  const totalStock = getTotalStock(product.variants);
  const stockStatus = getStockStatus(totalStock);
  const mainImage = getProductImage(product);

  return (
    <Link href={`/product/${product.slug}`} className={`product-card ${className}`.trim()}>
      <div className="product-card-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mainImage} alt={product.name} loading="lazy" />
        {totalStock <= 0 ? (
          <div className="product-card-badge">SOLD OUT</div>
        ) : totalStock <= 5 ? (
          <div className="product-card-badge" style={{ backgroundColor: '#C05621' }}>LIMITED</div>
        ) : null}
      </div>

      <div className="product-card-info">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          {totalStock <= 0 ? (
            <span className="product-card-sold-out">SOLD OUT</span>
          ) : (
            formatPrice(product.price)
          )}
        </div>
      </div>
    </Link>
  );
}
