
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProducts, type Product } from "../services/api";

function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Unable to load category products."))
      .finally(() => setLoading(false));
  }, []);

  const categoryProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.category === decodeURIComponent(category || "")
      )
      .sort((a, b) => b.rating.rate - a.rating.rate);
  }, [products, category]);

  const topRatedProducts = categoryProducts.slice(0, 5);
  const additionalProducts = categoryProducts.slice(5);

  if (loading) {
    return <main className="catalogue">Loading category...</main>;
  }

  if (error) {
    return <main className="catalogue"><p role="alert">{error}</p></main>;
  }

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
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMMUNITY FAVOURITES</p>
            <h2>Top rated in {category}</h2>
          </div>
        </div>

        {topRatedProducts.length === 0 ? (
          <p>No products found in this category.</p>
        ) : (
          <div className="product-grid">
            {topRatedProducts.map((product) => (
              <Link
                to={`/products/${product.id}`}
                className="product-card product-card-link"
                key={product.id}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.title} />
                  <span className="rating">
                    ★ {product.rating.rate.toFixed(1)}
                  </span>
                </div>
                <p className="category">{product.category}</p>
                <h3>{product.title}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {additionalProducts.length > 0 && (
        <section className="products-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MORE TO DISCOVER</p>
              <h2>More from this collection</h2>
            </div>
          </div>

          <div className="product-grid">
            {additionalProducts.map((product) => (
              <Link
                to={`/products/${product.id}`}
                className="product-card product-card-link"
                key={product.id}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.title} />
                  <span className="rating">
                    ★ {product.rating.rate.toFixed(1)}
                  </span>
                </div>
                <p className="category">{product.category}</p>
                <h3>{product.title}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer>COLLECTIVE. — A catalogue of considered choices.</footer>
    </main>
  );
}

export default CategoryPage;
