import { Link } from "react-router-dom";
import type { Product } from "../services/api";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="product-card product-card-link"
    >
      <div className="product-image">
        <img src={product.image} alt={product.title} loading="lazy" />
        <span className="rating">★ {product.rating.rate.toFixed(1)}</span>
      </div>
      <p className="category">{product.category}</p>
      <h3>{product.title}</h3>
      <p className="price">${product.price.toFixed(2)}</p>
    </Link>
  );
}

export default ProductCard;
