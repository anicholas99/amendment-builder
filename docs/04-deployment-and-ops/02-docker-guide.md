# 4.2 Docker Guide

This guide provides instructions for building and running the application using Docker. Containerizing the application ensures a consistent and reproducible environment across development, testing, and production.

## Dockerfile Best Practices

The application's `Dockerfile` is located at the root of the project and is optimized for production builds. It incorporates several best practices:

-   **Multi-Stage Builds**: The Dockerfile uses multiple `FROM` statements to create a small, secure final image. It uses a `builder` stage to install all dependencies and build the application, then copies only the necessary production artifacts to a clean `runner` stage.
-   **Security**: The final image uses a non-root user (`nextjs`) to run the application, reducing potential security risks.
-   **Performance**: It leverages the Next.js `standalone` output mode, which automatically copies only the required files and `node_modules` into the final image, resulting in a smaller footprint.
-   **Health Check**: A `HEALTHCHECK` instruction is included to allow Docker to automatically verify the application's health.

## Building the Docker Image

To build the production Docker image, run the following command from the root of the project:

```bash
docker build -t patent-drafter-ai:latest .
```

You can replace `latest` with a specific version tag, such as `v1.0.0`.

## Running the Application with Docker

To run the application in a Docker container, you will need to provide the necessary environment variables. The easiest way to do this is with an environment file.

1.  **Create an Environment File**
    Create a file named `.env.production` (or any other name) and populate it with the required production environment variables. Refer to `.env.example` for the full list of required variables.

    **Example `.env.production`:**
    ```env
    NODE_ENV=production
    DATABASE_URL="<your-production-database-url>"
    AUTH0_SECRET="<your-production-secret>"
    # ... other production variables
    ```

2.  **Run the Docker Container**
    Use the `--env-file` flag to pass your environment file to the container. The `-p` flag maps your local port 3000 to the container's port 3000.

    ```bash
    docker run -p 3000:3000 --env-file .env.production patent-drafter-ai:latest
    ```

The application will now be running and accessible at [http://localhost:3000](http://localhost:3000). 