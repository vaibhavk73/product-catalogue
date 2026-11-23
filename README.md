# Collective — Product Catalogue

A full-stack product catalogue MVP where customers can browse products, explore categories, search the catalogue, view product details and submit product enquiries.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Validation | Zod |
| Email | Nodemailer |
| Product data | Fake Store API |
| Testing | Vitest, Supertest |
| Local email testing | Mailpit |

## Architecture

The application separates the frontend, backend and external providers.

- **Client:** React application responsible for the user interface and interactions.
- **Backend:** Express API responsible for product retrieval, search, validation and enquiry handling.
- **Product provider:** Isolates Fake Store API integration from the rest of the application.
- **Email provider:** Isolates email delivery behind a separate integration module.

The frontend never calls Fake Store API directly. All product data is retrieved through the backend.

## Features

- Home page displaying the five highest-rated featured products.
- Category pages displaying products ordered by rating.
- Product search through the backend API.
- Individual product details pages.
- Product enquiry form with server-side validation.
- Email delivery through a configurable SMTP provider.
- Customer thank-you confirmation after successful enquiry submission.
- Backend API tests covering key routes and validation scenarios.

## Project Structure

```text
product-catalogue/
├── .gitignore
├── DECISIONS.md
├── AI_USAGE.md
├── README.md
├── client/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── assets/
│       │   └── hero.png
│       ├── components/
│       │   └── ProductCard.tsx
│       ├── pages/
│       │   ├── CategoryPage.tsx
│       │   ├── EnquiryPage.tsx
│       │   ├── EnquiryPage.css
│       │   └── ProductDetails.tsx
│       ├── services/
│       │   └── api.ts
│       ├── App.tsx
│       ├── App.css
│       ├── index.css
│       └── main.tsx
└── server/
    ├── .env.example
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    └── src/
        ├── integrations/
        │   ├── email-provider.ts
        │   └── product-provider.ts
        ├── __tests__/
        │   ├── health.test.ts
        │   └── product-not-found.test.ts
        ├── app.ts
        └── index.ts
```

## Prerequisites

- Node.js 22.12.0 or later on a Vitest-supported release line. Node.js 22 LTS or 24 LTS is recommended.
- npm
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd product-catalogue
```

### 2. Start the local email server

The enquiry feature uses SMTP. For local testing, Mailpit captures outgoing emails without sending real emails.

1. Download the Mailpit binary for your operating system from the [Mailpit releases page](https://github.com/axllent/mailpit/releases).
2. Extract the downloaded archive.
3. Open a terminal in the extracted folder and start Mailpit.

**Windows PowerShell:**

```powershell
.\mailpit.exe --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025
```

**macOS/Linux:**

```bash
./mailpit --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025
```

4. Keep Mailpit running while testing the application.
5. Open [http://127.0.0.1:8025](http://127.0.0.1:8025) to view captured emails.

No real emails are delivered during local testing.

### 3. Start the backend

Open a new terminal in the project directory:

```bash
cd server
npm install
```

Create a `.env` file from the example configuration.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

[http://localhost:3000](http://localhost:3000)

### 4. Start the frontend

Open another terminal in the project directory:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

[http://localhost:5173](http://localhost:5173)

## Environment Configuration

The backend uses environment variables for SMTP and server configuration.

Example configuration from `server/.env.example`:

```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
TRUST_PROXY_HOPS=0

SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=

SALES_EMAIL=sales@collective.local
```

For local email testing, Mailpit captures outgoing emails without sending real emails.

Mailpit defaults used by this project:

- SMTP: `127.0.0.1:1025`
- Web inbox: [http://127.0.0.1:8025](http://127.0.0.1:8025)

For production, configure an appropriate SMTP provider and sales inbox.

The frontend API URL can be configured using `VITE_API_BASE_URL`. If omitted, it defaults to `http://localhost:3000`.
`ALLOWED_ORIGINS` is a comma-separated list of browser origins allowed by the API. Set it to the deployed frontend origin in production.
`TRUST_PROXY_HOPS` defaults to `0`. Set it to the number of trusted reverse-proxy hops when deploying behind a known proxy so per-client rate limits use the client address.

The enquiry endpoint limits each client address to five submissions per 15 minutes. This in-memory limit is intended for a single MVP server instance; multi-instance deployments should use a shared rate-limit store and appropriate proxy configuration.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Retrieve products |
| GET | `/api/products?search=<term>` | Search products |
| GET | `/api/products?category=<category>` | Retrieve products in a category |
| GET | `/api/products/:id` | Retrieve product details |
| GET | `/api/categories` | Retrieve categories |
| POST | `/api/enquiries` | Submit a product enquiry |

## Validation

### Frontend validation

From the client directory:

```bash
cd client
npm run build
npm run lint
```

- `npm run build` runs TypeScript checks and creates the production build.
- `npm run lint` runs ESLint checks.

The frontend package does not define an automated test script.

### Backend automated tests

From the server directory:

```bash
cd server
npm test
```

Backend automated tests use Vitest and Supertest. External network and email calls are mocked or stubbed so the tests do not depend on live services.

## Design Decisions

See [DECISIONS.md](DECISIONS.md) for assumptions, trade-offs, architectural choices and possible next steps.

## AI Usage

See [AI_USAGE.md](AI_USAGE.md) for the AI tools used, important prompts, review process and corrections made during development.
