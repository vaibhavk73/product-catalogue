import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { fetchCategories, fetchProducts, type Product } from "./services/api";
import ProductCard from "./components/ProductCard";
import ProductDetails from "./pages/ProductDetails";
import CategoryPage from "./pages/CategoryPage";
import EnquiryPage from "./pages/EnquiryPage";
import "./App.css";

function CatalogueHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchState, setSearchState] = useState<{ term: string; results?: Product[]; error?: string } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(undefined, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setProducts(data);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setCatalogueError("Unable to load catalogue. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    fetchCategories(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCategories(data);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setCategoryError("Unable to load categories.");
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (!term) return;

    const controller = new AbortController();
    let current = true;
    const timeoutId = setTimeout(async () => {
      try {
        const results = await fetchProducts(term, controller.signal);
        if (current) setSearchState({ term, results });
      } catch (error) {
        if (current && !(error instanceof DOMException && error.name === "AbortError")) {
          setSearchState({ term, error: "Unable to search products. Please try again." });
        }
      }
    }, 300);

    return () => {
      current = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search]);

  const featuredProducts = [...products]
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, 5);
  const searchTerm = search.trim();
  const currentSearch = searchState?.term === searchTerm ? searchState : null;
  const searchLoading = Boolean(searchTerm && !currentSearch);
  const searchError = currentSearch?.error || "";
  const displayedProducts = searchTerm ? currentSearch?.results || [] : products;

  return (
    <main className="catalogue">
      <header className="header">
        <Link className="logo" to="/">COLLECTIVE.</Link>
        <nav aria-label="Main navigation">
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
        <a href="#products" className="hero-button">Explore collection →</a>
      </section>

      <section className="products-section">
        <div className="section-heading">
          <div><p className="eyebrow">THE COMMUNITY FAVOURITES</p><h2>Top rated products</h2></div>
          <span>01 — 05</span>
        </div>
        {loading ? <p>Loading featured products...</p> : catalogueError ? <p role="alert">{catalogueError}</p> : (
          <div className="product-grid">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div><p className="eyebrow">EXPLORE OUR COLLECTION</p><h2>Discover products</h2></div>
        </div>
        <input
          className="search-input"
          type="search"
          aria-label="Search products"
          placeholder="Search products..."
          value={search}
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value);
          }}
        />
        {categoryError && <p role="status">{categoryError}</p>}
        <div className="category-list">
          {categories.map((category) => (
            <Link key={category} to={`/categories/${encodeURIComponent(category)}`} className="category-link">
              {category}
            </Link>
          ))}
        </div>
        {loading && <p>Loading products...</p>}
        {catalogueError && <p role="alert">{catalogueError}</p>}
        {searchError && <p role="alert">{searchError}</p>}
        {!loading && !catalogueError && (
          <>
            <p className="results-count" aria-live="polite">
              {searchLoading ? "Searching..." : `${displayedProducts.length} products found`}
            </p>
            {!searchLoading && !searchError && displayedProducts.length === 0 ? (
              <p>No products found. Try another search.</p>
            ) : (
              <div className="product-grid">
                {displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </>
        )}
      </section>

      <footer>COLLECTIVE. — A catalogue of considered choices. <Link to="/enquiry">Send us an enquiry →</Link></footer>
    </main>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<CatalogueHome />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/categories/:category" element={<CategoryPage />} />
      <Route path="/enquiry" element={<EnquiryPage />} />
      <Route path="*" element={<main className="catalogue"><h1>Page not found</h1><Link to="/">Back to catalogue</Link></main>} />
    </Routes>
  );
}

export default AppRouter;
