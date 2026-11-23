
import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import {
  fetchProducts,
  fetchCategories,
  type Product,
} from "./services/api";
import ProductDetails from "./pages/ProductDetails";
import CategoryPage from "./pages/CategoryPage";
import EnquiryPage from "./pages/EnquiryPage";
import "./App.css";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch(() => setError("Unable to load catalogue. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const term = search.trim();

    if (!term) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);

      try {
        const results = await fetchProducts(term);
        setSearchResults(results);
      } catch {
        setError("Unable to search products. Please try again.");
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const featuredProducts = [...products]
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, 5);

  const displayedProducts = search.trim()
    ? searchResults
    : products;

  return (
    <main className="catalogue">
      <header className="header">
        <Link className="logo" to="/">COLLECTIVE.</Link>
        <nav>
          <Link to="/">Home</Link>
          <a href="#products">Discover</a>
          <Link to="/enquiry">Contact</Link>
        </nav>
        <span className="header-label">THE PRODUCT EDIT</span>
      </header>

      <section className="hero">
        <p className="eyebrow">CURATED FOR EVERYDAY LIVING</p>
        <h1>Find something<br />worth keeping.</h1>
        <p>Thoughtfully selected products. Discover your next favourite.</p>
        <a href="#products" className="hero-button">
          Explore collection →
        </a>
      </section>

      <section className="products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COMMUNITY FAVOURITES</p>
            <h2>Top rated products</h2>
          </div>
          <span>01 — 05</span>
        </div>

        {loading ? (
          <p>Loading featured products...</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
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

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORE OUR COLLECTION</p>
            <h2>Discover products</h2>
          </div>
        </div>

        <input
          className="search-input"
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setError("");
          }}
        />

        <div className="category-list">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/categories/${encodeURIComponent(category)}`}
              className="category-link"
            >
              {category}
            </Link>
          ))}
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <>
            <p className="results-count">
              {searchLoading
                ? "Searching..."
                : `${displayedProducts.length} products found`}
            </p>

            {!searchLoading && displayedProducts.length === 0 ? (
              <p>No products found. Try another search.</p>
            ) : (
              <div className="product-grid">
                {displayedProducts.map((product) => (
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
          </>
        )}
      </section>

      <footer>
        COLLECTIVE. — A catalogue of considered choices.
        <Link to="/enquiry"> Send us an enquiry →</Link>
      </footer>
    </main>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/categories/:category" element={<CategoryPage />} />
      <Route path="/enquiry" element={<EnquiryPage />} />
    </Routes>
  );
}

export default AppRouter;
