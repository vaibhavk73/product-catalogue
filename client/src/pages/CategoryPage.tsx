import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProducts, type Product } from "../services/api";
import ProductCard from "../components/ProductCard";

function CategoryPage() {
  const { category = "" } = useParams<{ category: string }>();
  const [result, setResult] = useState<{ category: string; products?: Product[]; error?: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(undefined, controller.signal, category)
      .then((products) => {
        if (!controller.signal.aborted) setResult({ category, products });
      })
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setResult({ category, error: "Unable to load category products." });
        }
      });
    return () => controller.abort();
  }, [category]);

  const loading = result?.category !== category;
  const error = loading ? "" : result?.error || "";
  const categoryProducts = useMemo(
    () => [...(loading ? [] : result?.products || [])].sort((a, b) => b.rating.rate - a.rating.rate),
    [loading, result]
  );
  const topRatedProducts = categoryProducts.slice(0, 5);
  const additionalProducts = categoryProducts.slice(5);

  if (loading) return <main className="catalogue">Loading category...</main>;
  if (error) return <main className="catalogue"><p role="alert">{error}</p><Link to="/">Back to catalogue</Link></main>;

  return (
    <main className="catalogue">
      <header className="header">
        <Link className="logo" to="/">COLLECTIVE.</Link>
        <Link to="/">← Back to catalogue</Link>
      </header>
      <section className="hero">
        <p className="eyebrow">EXPLORE THE COLLECTION</p>
        <h1>{category}</h1>
        <p>{categoryProducts.length} products in this collection.</p>
      </section>
      <section className="products-section">
        <div className="section-heading"><div><p className="eyebrow">COMMUNITY FAVOURITES</p><h2>Top rated in {category}</h2></div></div>
        {topRatedProducts.length === 0 ? <p>No products found in this category.</p> : (
          <div className="product-grid">{topRatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>
      {additionalProducts.length > 0 && (
        <section className="products-section">
          <div className="section-heading"><div><p className="eyebrow">MORE TO DISCOVER</p><h2>More from this collection</h2></div></div>
          <div className="product-grid">{additionalProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}
      <footer>COLLECTIVE. — A catalogue of considered choices.</footer>
    </main>
  );
}

export default CategoryPage;
