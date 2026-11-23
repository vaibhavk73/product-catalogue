
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchProductById,
  type Product,
} from "../services/api";

function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Product not found.");
      setLoading(false);
      return;
    }

    fetchProductById(Number(id))
      .then(setProduct)
      .catch(() => setError("Unable to load this product."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="catalogue">Loading product...</main>;

  if (error || !product) {
    return (
      <main className="catalogue">
        <p role="alert">{error || "Product not found."}</p>
        <Link to="/">Back to catalogue</Link>
      </main>
    );
  }

  return (
    <main className="catalogue">
      <header className="header">
        <Link className="logo" to="/">COLLECTIVE.</Link>
        <Link to="/">← Back to catalogue</Link>
      </header>

      <section className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product-detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.title}</h1>
          <p className="detail-rating">
            ★ {product.rating.rate.toFixed(1)} ({product.rating.count} reviews)
          </p>
          <p className="detail-price">${product.price.toFixed(2)}</p>
          <p className="detail-description">{product.description}</p>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
