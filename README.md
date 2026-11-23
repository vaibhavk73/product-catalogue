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
├── client/
│   └── src/
│       ├── pages/
│       ├── services/
│       ├── App.tsx
│       └── App.css
├── server/
│   ├── src/
│   │   ├── integrations/
│   │   │   ├── email-provider.ts
│   │   │   └── product-provider.ts
│   │   ├── __tests__/
│   │   │   └── health.test.ts
│   │   ├── app.ts
│   │   └── index.ts
│   └── .env.example
├── DECISIONS.md
├── AI_USAGE.md
└── README.md
```

## Prerequisites

- Node.js 20 or later
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

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Retrieve products |
| GET | `/api/products?search=<term>` | Search products |
| GET | `/api/products/:id` | Retrieve product details |
| GET | `/api/categories` | Retrieve categories |
| POST | `/api/enquiries` | Submit a product enquiry |

## Running Tests

From the server directory:

```bash
npm test
```

The backend tests use Vitest and Supertest. External product and email providers are mocked to keep tests deterministic and independent of external services.

## Design Decisions

See [DECISIONS.md](DECISIONS.md) for assumptions, trade-offs, architectural choices and possible next steps.

## AI Usage

See [AI_USAGE.md](AI_USAGE.md) for the AI tools used, important prompts, review process and corrections made during development.
