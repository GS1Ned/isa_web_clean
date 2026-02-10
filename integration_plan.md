# Pino and Grafana/Loki Integration Plan

## Phase 1: Pino Logging Integration (Completed)

- **Install Pino and pino-pretty**: The `pino` and `pino-pretty` packages have been successfully installed as project dependencies.
- **Create Centralized Logger Configuration**: The existing logger at `server/utils/server-logger.ts` has been replaced with a new Pino-based logger configuration.
- **Integrate Logger into Application Code**: All instances of `console.log` and `console.error` in the main application files (`server/_core/index.ts` and `server/_core/logger-wiring.ts`) have been replaced with the new `serverLogger`.
- **Structured Logging**: The new logger is configured to produce structured JSON logs, including trace IDs for easier debugging.

## Phase 2: Loki and Grafana Setup (Completed)

- **Docker Compose Configuration**: A `docker-compose.yml` file has been created to define the Loki and Grafana services.
- **Loki Configuration**: A `loki-config.yaml` file has been created to configure the Loki instance.
- **Grafana Provisioning**: Grafana has been configured with a pre-provisioned Loki data source and a default dashboard for viewing application logs.
- **Pino-Loki Integration**: The `pino-loki` package has been installed and configured as a transport for the Pino logger, enabling logs to be sent to the Loki instance.

## Next Steps for the User

Due to limitations in the sandbox environment, the Docker services could not be started. The following steps should be performed in your local development environment:

1.  **Start the Observability Stack**: Run the following command in the root of the project to start the Grafana and Loki services:

    ```bash
    docker-compose up -d
    ```

2.  **Start the Application**: Start the application in development mode:

    ```bash
    npm run dev
    ```

3.  **View Logs in Grafana**:
    -   Access Grafana at `http://localhost:3000`.
    -   Log in with the username `admin` and password `admin`.
    -   Navigate to the "Application Logs" dashboard to view the logs from the Node.js application.
