# 1. Getting Started

This guide provides everything you need to set up, configure, and run the Patent Drafter AI application on your local machine for development.

## Table of Contents
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Running Tests](#-running-tests)
- [Troubleshooting](#-troubleshooting)

---

## 📋 Prerequisites

Before you begin, ensure you have the following tools installed and running on your system:

- **Node.js**: `v18.0.0` or higher.
- **npm**: `v8.0.0` or higher (or `yarn`).
- **Git**: For cloning the repository.
- **Database**: A running instance of PostgreSQL 14+ (or Azure SQL Database for production).
- **Azure Storage Emulator**: [Azurite](https://github.com/Azure/Azurite) is required for local file and figure uploads. It can be run via npm/npx.

---

## ⚙️ Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-org/patent-drafter-ai.git
    cd patent-drafter-ai
    ```

2.  **Install Dependencies**
    This command installs all necessary packages, including `devDependencies` required for development.
    ```bash
    npm install
    ```

---

## 🔑 Environment Configuration

Application secrets and configuration are managed via an environment file.

1.  **Create Your Environment File**
    Copy the example file to create your local configuration. This file is git-ignored and will not be committed.
    ```bash
    cp .env.example .env.local
    ```

2.  **Update `.env.local`**
    Open `.env.local` and fill in the required values. At a minimum, you will need to configure the database connection and your Auth0 credentials for local development.

    **Key Variables for Local Setup:**
    ```env
    # APPLICATION ENVIRONMENT
    NODE_ENV=development

    # DATABASE (Prisma)
    # Point this to your local PostgreSQL instance.
    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/patent_drafter_dev"

    # AUTHENTICATION (Auth0)
    # These are required to simulate login during development.
    AUTH0_SECRET="<generate a secret with: openssl rand -hex 32>"
    AUTH0_BASE_URL="http://localhost:3000"
    AUTH0_ISSUER_BASE_URL="https://<your-tenant>.auth0.com"
    AUTH0_CLIENT_ID="<your-auth0-client-id>"
    AUTH0_CLIENT_SECRET="<your-auth0-client-secret>"

    # AI PROVIDERS
    # At least one AI provider is needed for core functionality.
    AI_PROVIDER=openai
    OPENAI_API_KEY="<your-openai-api-key>"

    # RATE LIMITING (Redis - optional for development)
    # For development, rate limiting can run in-memory mode
    # For production, configure Redis connection
    REDIS_URL="redis://localhost:6379"  # Optional - will use in-memory if not set

    # AZURE STORAGE (Azurite for local)
    # The default value in .env.example points to a standard local Azurite instance.
    AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
    AZURE_STORAGE_CONTAINER_NAME=figures
    ```
    *For a complete list of all variables, refer to the `.env.example` file.*

---

## 🗄️ Database Setup

The application uses Prisma for database migrations.

1.  **Create the Development Database**
    Make sure your PostgreSQL instance is running, then create the database specified in your `DATABASE_URL` (e.g., `patent_drafter_dev`). You can do this using psql, pgAdmin, or any PostgreSQL client.

2.  **Run Database Migrations**
    This command applies all pending migrations from the `prisma/migrations` directory to your database, creating the necessary tables and columns.
    ```bash
    npx prisma migrate dev
    ```

---

## ▶️ Running the Application

1.  **Start Local Storage Emulator (Azurite)**
    In a separate terminal, start the Azurite service. This emulates Azure Storage for local file uploads.
    ```bash
    npx azurite --silent --location ./azurite-data
    ```

2.  **Run the Development Server**
    In another terminal, run the Next.js development server.
    ```bash
    npm run dev
    ```

The application should now be running and accessible at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Tests

To ensure the application is functioning correctly, you can run the test suite.

```bash
# Run all unit tests
npm test

# Run tests in watch mode for active development
npm run test:watch
```

---

## 🐛 Troubleshooting

-   **Database Connection Errors**:
    -   Ensure your PostgreSQL instance is running and accessible.
    -   Double-check the `DATABASE_URL` in your `.env.local` file.
    -   Verify the database user and password are correct.
-   **Auth0 Errors on Login**:
    -   Confirm all `AUTH0_*` variables are set correctly in `.env.local`.
    -   Ensure the "Allowed Callback URLs" in your Auth0 application settings is exactly `http://localhost:3000/api/auth/callback`.
-   **File Upload Failures**:
    -   Make sure the Azurite terminal instance is running.
    -   If issues persist, try clearing the Azurite cache: `rm -rf ./azurite-data/*` and restart it.
-   **Port Conflicts**:
    -   If another service is using port 3000, you can run the app on a different port: `PORT=3001 npm run dev`. 