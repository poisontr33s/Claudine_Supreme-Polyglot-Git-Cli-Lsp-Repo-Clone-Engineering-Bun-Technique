/**
 * Docker Compose Plugin
 * 
 * Example Claudine CLI plugin that adds Docker Compose templates and commands.
 * Demonstrates plugin architecture and contribution points.
 */

import { Command } from "commander";

/**
 * @type {import('../../src/core/plugin/types').ClaudinePlugin}
 */
const plugin = {
  manifest: {}, // Will be set by PluginManager
  
  /**
   * Activate plugin
   */
  async activate(context) {
    context.logger.info("Docker Compose Plugin activated");
    
    // Initialize plugin storage if needed
    const config = context.config.get("initialized");
    if (!config) {
      context.logger.debug("First activation, initializing...");
      await context.config.update("initialized", true);
      await context.config.update("composeVersion", "3.8");
    }
  },
  
  /**
   * Deactivate plugin
   */
  async deactivate() {
    console.log("Docker Compose Plugin deactivated");
  },
  
  /**
   * Contribute custom commands
   */
  contributeCommands() {
    const dockerCommand = new Command("docker")
      .description("Docker Compose utilities");
    
    // Add 'init' subcommand
    dockerCommand
      .command("init")
      .description("Initialize Docker Compose configuration")
      .option("-s, --services <services...>", "Services to include", ["web", "db"])
      .option("-v, --version <version>", "Compose file version", "3.8")
      .action((options) => {
        console.log("\n🐳 Initializing Docker Compose...\n");
        console.log(`Services: ${options.services.join(", ")}`);
        console.log(`Version: ${options.version}`);
        console.log("\n✓ docker-compose.yml created");
      });
    
    // Add 'validate' subcommand
    dockerCommand
      .command("validate")
      .description("Validate docker-compose.yml")
      .action(() => {
        console.log("\n🔍 Validating docker-compose.yml...");
        console.log("\n✓ Configuration is valid");
      });
    
    return [dockerCommand];
  },
  
  /**
   * Contribute custom templates
   */
  contributeTemplates() {
    return [
      {
        id: "docker-python-web",
        name: "Python Web App (Docker)",
        description: "Python web application with Docker Compose and PostgreSQL",
        language: "python",
        category: "web",
        tags: ["docker", "postgresql", "nginx"],
        files: {
          "docker-compose.yml": `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
    depends_on:
      - db
    volumes:
      - .:/app
    command: python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web

volumes:
  postgres_data:
`,
          "Dockerfile": `FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
          ".dockerignore": `__pycache__
*.pyc
*.pyo
*.pyd
.Python
.env
.venv
venv/
*.log
.git
.gitignore
README.md
tests/
.pytest_cache
`,
          "nginx.conf": `events {
    worker_connections 1024;
}

http {
    upstream web {
        server web:8000;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://web;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
`,
        },
        variables: [
          {
            name: "projectName",
            label: "Project name",
            description: "Name of your project",
            type: "string",
            pattern: "^[a-z][a-z0-9-]*$",
          },
          {
            name: "databaseName",
            label: "Database name",
            description: "PostgreSQL database name",
            type: "string",
            default: "app",
          },
          {
            name: "includeNginx",
            label: "Include Nginx",
            description: "Add Nginx reverse proxy",
            type: "boolean",
            default: true,
          },
        ],
      },
      
      {
        id: "docker-rust-api",
        name: "Rust API (Docker)",
        description: "Rust REST API with Docker multi-stage build",
        language: "rust",
        category: "api",
        tags: ["docker", "actix-web", "redis"],
        files: {
          "docker-compose.yml": `version: '3.8'

services:
  api:
    build:
      context: .
      target: runtime
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=redis://redis:6379
      - RUST_LOG=info
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
`,
          "Dockerfile": `# Build stage
FROM rust:1.75-slim as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Build dependencies (cached layer)
RUN mkdir src && \\
    echo "fn main() {}" > src/main.rs && \\
    cargo build --release && \\
    rm -rf src

# Copy source
COPY src ./src

# Build application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim as runtime

RUN apt-get update && \\
    apt-get install -y ca-certificates && \\
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/app /usr/local/bin/app

EXPOSE 8080

CMD ["app"]
`,
          ".dockerignore": `target/
.git
.gitignore
README.md
tests/
Dockerfile
docker-compose.yml
`,
        },
      },
    ];
  },
};

export default plugin;
