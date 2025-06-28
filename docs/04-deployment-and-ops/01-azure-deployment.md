# 4.1 Azure Deployment Guide

This guide provides a step-by-step process for deploying the Patent Drafter AI application to Azure App Service.

## Table of Contents
- [Prerequisites](#-prerequisites)
- [Step 1: Provision Azure Resources](#-step-1-provision-azure-resources)
- [Step 2: Build and Push the Docker Image](#-step-2-build-and-push-the-docker-image)
- [Step 3: Configure and Deploy the App Service](#-step-3-configure-and-deploy-the-app-service)
- [Step 4: Run Database Migrations](#-step-4-run-database-migrations)
- [Step 5: Verify the Deployment](#-step-5-verify-the-deployment)

---

## 📋 Prerequisites

Before deploying, ensure you have:
-   An active Azure subscription.
-   [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed and configured.
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
-   A completed `.env.production` file with all required production credentials and settings.

---

## 📦 Step 1: Provision Azure Resources

You will need to create the following resources in the Azure Portal:

1.  **Azure Container Registry (ACR)**: To store your Docker images.
    -   Note the "Login server" name (e.g., `yourregistry.azurecr.io`).
2.  **Azure App Service**: To host the application.
    -   **Publish**: `Docker Container`
    -   **Operating System**: `Linux`
    -   **App Service Plan**: Choose a plan that meets your performance and cost requirements.
3.  **Azure SQL Database**: The production database.
    -   Create a server and a new database.
    -   Securely note the connection string; you will need it for the environment variables.
4.  **Azure Storage Account**: For file/figure uploads and (optionally) the citation job queue.
    -   Note the connection string.
5.  **Azure Cache for Redis** (Recommended): For distributed rate limiting and caching across multiple instances.
    -   Choose a pricing tier based on your needs (Basic C0 is sufficient for small deployments).
    -   Enable SSL/TLS only connections.
    -   Note the connection string format: `redis://:<password>@<name>.redis.cache.windows.net:6380?tls=true`
6.  **Azure OpenAI Service**: To provide AI capabilities.
    -   Deploy the required models (e.g., `gpt-4o`, `text-embedding-ada-002`).
    -   Note the endpoint and API key.

---

## 🐳 Step 2: Build and Push the Docker Image

1.  **Log in to Azure Container Registry**:
    ```bash
    az acr login --name <your-registry-name>
    ```

2.  **Build the Docker Image**:
    From the root of the project directory, run the build command. Tag the image with your ACR login server and a version number.
    ```bash
    docker build -t <your-registry-name>.azurecr.io/patent-drafter-ai:v1.0.0 .
    ```

3.  **Push the Image to ACR**:
    ```bash
    docker push <your-registry-name>.azurecr.io/patent-drafter-ai:v1.0.0
    ```

---

## 🚀 Step 3: Configure and Deploy the App Service

1.  **Set App Service to Use Your Docker Image**:
    -   In the Azure Portal, navigate to your App Service.
    -   Go to **Deployment Center**.
    -   Set **Source** to `Azure Container Registry`.
    -   Select your registry, the image (`patent-drafter-ai`), and the tag (`v1.0.0`).
    -   Save the changes.

2.  **Configure Environment Variables**:
    -   In your App Service, go to **Configuration** -> **Application settings**.
    -   Add all the key-value pairs from your `.env.production` file. **Do not commit your `.env.production` file.**
    -   **Key Variables to Set**:
        -   `NODE_ENV=production`
        -   `DATABASE_URL` (from your Azure SQL Database)
        -   `AZURE_STORAGE_CONNECTION_STRING`
        -   `AI_PROVIDER=azure`
        -   `AZURE_OPENAI_ENDPOINT`
        -   `AZURE_OPENAI_API_KEY`
        -   `REDIS_URL` (from your Azure Cache for Redis - optional but recommended)
        -   ... and all other variables from `.env.example`.
    -   Save the configuration. The App Service will restart with the new settings.

---

## 🗄️ Step 4: Run Database Migrations

After the application is deployed and running, you need to apply the database migrations to your production database.

1.  **SSH into the App Service Container**:
    -   Navigate to your App Service in the Azure Portal.
    -   Under **Development Tools**, select **SSH** and click "Go".

2.  **Run the Deploy Migration Command**:
    -   Once connected to the shell, run the Prisma `migrate deploy` command. This command applies all pending migrations and is safe to run in production.
    ```bash
    npx prisma migrate deploy
    ```

---

## ✅ Step 5: Verify the Deployment

1.  **Check the Health Endpoint**:
    -   Navigate to `https://<your-app-name>.azurewebsites.net/api/health`. You should see a `{"status":"healthy",...}` response.
2.  **Test Application Functionality**:
    -   Open the application's URL.
    -   Log in and verify that you can access the main features.
    -   Test a feature that relies on the database and AI services to ensure all connections are working correctly. 