
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ApiError,
  fetchProductById,
  type Product,
} from "../services/api";

function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<{ id: string; product?: Product; error?: string } | null>(null);
  const validId = Boolean(id && /^\d+$/.test(id) && Number(id) > 0);

  useEffect(() => {
    const controller = new AbortController();
    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) return () => controller.abort();

    fetchProductById(Number(id), controller.signal)
      .then((product) => {
        if (!controller.signal.aborted) setResult({ id, product });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
        setResult({ id, error: error instanceof ApiError && error.status === 404 ? "Product not found." : "Unable to load this product." });
      });
    return () => controller.abort();
  }, [id]);

  if (!validId) return <main className="catalogue"><p role="alert">Product not found.</p><Link to="/">Back to catalogue</Link></main>;
  const loading = result?.id !== id;
  const product = loading ? null : result?.product || null;
  const error = loading ? "" : result?.error || "";
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
