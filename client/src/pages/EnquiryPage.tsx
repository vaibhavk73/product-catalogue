
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "./EnquiryPage.css";

interface EnquiryFormData {
  name: string;
  email: string;
  product: string;
  message: string;
}

function EnquiryPage() {
  const [form, setForm] = useState<EnquiryFormData>({
    name: "",
    email: "",
    product: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/api/enquiries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send enquiry.");
      }

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        product: "",
        message: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="catalogue enquiry-page">
      <header className="header">
        <Link className="logo" to="/">COLLECTIVE.</Link>
        <Link to="/">← Back to catalogue</Link>
      </header>

      <section className="enquiry-container">
        <p className="eyebrow">WE'D LOVE TO HEAR FROM YOU</p>
        <h1>Let's talk.</h1>
        <p className="enquiry-intro">
          Interested in a product? Send us a message and our team
          will get back to you.
        </p>

        {success ? (
          <div className="success-message" role="status">
            <h2>Thank you!</h2>
            <p>Your enquiry has been received successfully.</p>
            <Link to="/">Continue exploring →</Link>
          </div>
        ) : (
          <form className="enquiry-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="Enter your full name"
            />

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              maxLength={254}
              placeholder="you@example.com"
            />

            <label htmlFor="product">Product of interest</label>
            <input
              id="product"
              name="product"
              value={form.product}
              onChange={handleChange}
              required
              maxLength={200}
              placeholder="Which product are you interested in?"
            />

            <label htmlFor="message">Your message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              maxLength={2000}
              rows={5}
              placeholder="Tell us how we can help..."
            />

            {error && <p className="form-error" role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send enquiry →"}
            </button>
          </form>
        )}
      </section>

      <footer>COLLECTIVE. — A catalogue of considered choices.</footer>
    </main>
  );
}

export default EnquiryPage;
