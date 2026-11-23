# AI Usage Notes

## 1. Tools Used

- **ChatGPT (GPT-6):** Used as a development assistant for architecture guidance, implementation planning, debugging, testing strategy and documentation.
- **Cursor:** Used as the code editor and local development environment for creating and managing the project.
- **Node.js and npm:** Used to run the application, install dependencies and execute tests.

## 2. Agent Instruction Files

No persistent AI agent instruction files such as `AGENTS.md`, `CLAUDE.md` or `.cursor/rules` were created or committed for this project.

Development guidance was provided through direct prompts and iterative conversations with ChatGPT and Cursor.

## 3. Development Approach

The solution was developed incrementally with AI assistance.

The workflow was:

1. Understand the acceptance criteria and identify the main application responsibilities.
2. Establish a React frontend and Node.js backend.
3. Separate external product and email integrations from the API routes.
4. Implement the catalogue browsing and search experience.
5. Implement product details and the enquiry workflow.
6. Add backend tests and verify the critical user journeys.
7. Review the implementation and prepare submission documentation.

AI-generated suggestions were treated as implementation assistance, not as automatically correct decisions.

## 4. Key Prompts and AI-Assisted Decisions

The following prompts and development discussions shaped the implementation.

### Prompt 1: Architecture and project setup

"Help me build a product catalogue using React, TypeScript and a Node.js backend. Keep the architecture maintainable and separate external integrations."

**Outcome:** Established separate frontend, backend and provider responsibilities.

### Prompt 2: Product data integration

"Ensure the frontend never calls Fake Store API directly. Route all product data through the backend."

**Outcome:** Implemented a backend product provider and frontend API service.

### Prompt 3: Search implementation

"Implement product search so that only products matching the search term are displayed."

**Outcome:** Search was implemented through the backend, matching product titles, descriptions and categories.

### Prompt 4: Enquiry and email integration

"Implement a product enquiry form with server-side validation, email delivery and a customer confirmation message."

**Outcome:** Added Zod validation, a separate Nodemailer integration and a successful submission confirmation.

### Prompt 5: Testing and verification

"Help me test the backend API routes and enquiry workflow using Vitest and Supertest."

**Outcome:** Added backend tests covering health checks, product retrieval, search, invalid product IDs and enquiry validation and submission.

## 5. Review and Verification

The implementation was verified through manual testing and automated tests.

- Confirmed the home page displays featured products.
- Verified category product ordering.
- Tested matching search results.
- Tested search with a term that returns no products.
- Verified individual product details.
- Submitted a sample enquiry.
- Confirmed the generated email appeared in the local Mailpit inbox.
- Ran the backend test suite and confirmed all eight tests passed.
- Ran backend TypeScript compilation successfully.
- Ran the frontend production build successfully.
- Cloned the public GitHub repository into a separate directory and repeated the backend tests, TypeScript compilation and frontend production build successfully.

## 6. AI Limitations and Corrections

AI-generated code and setup suggestions required verification during implementation.

- Initial backend TypeScript configuration produced module and type-definition issues. These were addressed by installing the required type packages and adjusting the TypeScript configuration.
- The Windows PowerShell environment did not execute `npm.ps1` because of its execution policy. Using `npm.cmd` provided a working alternative without changing the machine's security settings.
- The initial email integration required a local SMTP solution for testing. Mailpit was configured to capture emails without requiring real email credentials.

These issues reinforced the importance of running the application and tests rather than relying only on generated code or explanations.

## 7. Ownership

AI assisted with planning, implementation guidance, debugging and documentation.

The final implementation was checked by running the application, exercising its main workflows and executing the available tests.

I am responsible for understanding and explaining the architecture, implementation choices, trade-offs and remaining limitations.

## 8. Actual Time Spent

| Activity | Time |
|---|---:|
| Planning and architecture | 45 minutes |
| Building and implementation | 3 hours 15 minutes |
| Testing and debugging | 1 hour 30 minutes |
| Reviewing and documentation | 30 minutes |
| **Total** | **6 hours** |

