# Design Decisions and Assumptions

## 1. Technology Choices

### Frontend: React + TypeScript

React was selected because the product catalogue is primarily an interactive web experience. TypeScript provides static type checking and helps maintain consistency between API responses and UI components.

### Backend: Node.js + Express + TypeScript

Express provides a lightweight API layer without introducing unnecessary framework complexity. TypeScript improves maintainability and makes API contracts easier to understand.

### External Integrations

The product data source and email delivery mechanism are isolated behind separate provider modules:

- `product-provider.ts` handles communication with Fake Store API.
- `email-provider.ts` handles outgoing enquiry emails through Nodemailer.

This separation allows either integration to be replaced without significantly changing the application routes or frontend.

The email provider is isolated from the enquiry API, so a different SMTP provider or email delivery service can be introduced without changing the enquiry workflow.

## 2. Assumptions

The acceptance criteria leave some implementation details open. The following assumptions were made:

1. The five highest-rated products across the available catalogue are featured on the home page.
2. Products within each category are sorted by rating in descending order.
3. The category page displays the top five products first, followed by the remaining products.
4. Search matches product titles, descriptions and category names.
5. Search results are retrieved through the backend rather than directly from the external product API.
6. The enquiry form requires a customer's name, valid email address, product name and message.
7. A successful email submission triggers a thank-you confirmation for the customer.
8. Mailpit is used for local email testing so reviewers do not need a paid email service or real SMTP credentials.

## 3. Architecture and Extensibility

The application is divided into three main responsibilities:

- Frontend presentation and user interactions.
- Backend API and business logic.
- External product and email integrations.

The frontend communicates exclusively with the backend for product data.

The backend uses provider modules to isolate external dependencies. This makes it easier to introduce a different product catalogue provider or email service in the future.

The API provides a boundary between the frontend and backend, allowing either layer to evolve independently.

The current provider-based design keeps external service dependencies separate from application logic, providing a foundation for future changes without introducing unnecessary infrastructure at the MVP stage.

## 4. Simplifications and Trade-offs

- Fake Store API is used instead of a custom product database because product metadata is not important for this proof of concept.
- Product search currently retrieves the catalogue through the backend and filters the results in the backend. A dedicated search index or database query would be more suitable for a larger catalogue.
- Category filtering and rating-based ordering are handled by the frontend using the retrieved catalogue. This keeps the implementation simple for the small proof-of-concept dataset. For a larger catalogue, filtering, sorting and pagination could move to the backend.
- Mailpit is used for local email verification. A production deployment would require a properly configured SMTP provider.
- The solution focuses on the required catalogue and enquiry workflow rather than introducing authentication, administration or inventory management.

## 5. What I Would Do With Another Day

1. Add stronger API integration tests, including provider failures and edge cases.
2. Improve API error handling and introduce consistent error response structures.
3. Add request rate limiting and restrict CORS to approved frontend origins.
4. Improve search performance with pagination and backend-side filtering at the data-provider level.
5. Introduce a persistent product and enquiry database if the product catalogue moves beyond the proof-of-concept stage.
6. Add end-to-end tests covering browsing, searching and enquiry submission.
7. Add production-ready logging, monitoring and deployment configuration.
8. Improve accessibility and responsive behaviour across devices.

## 6. Guiding Principle

The objective was to build a small working MVP without making it a throwaway prototype.

The implementation keeps the critical boundaries clear, avoids unnecessary infrastructure and provides identifiable extension points for future changes to the product data source, frontend experience and email provider.
