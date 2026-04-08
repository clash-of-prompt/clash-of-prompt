# Simple approach: use pre-built binaries on Debian (no source compilation)
FROM node:20-slim

RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*

# Install Claude CLI
RUN npm install -g @anthropic-ai/claude-code

# Install minitiad (pre-built binary + shared libs)
RUN mkdir -p /usr/local/bin && \
    curl -L "https://github.com/initia-labs/minimove/releases/download/v1.1.11/minimove_v1.1.11_Linux_x86_64.tar.gz" \
    -o /tmp/minitiad.tar.gz && \
    tar xzf /tmp/minitiad.tar.gz -C /usr/local/bin/ && \
    cp /usr/local/bin/*.so /usr/lib/ 2>/dev/null || true && \
    ldconfig && \
    rm /tmp/minitiad.tar.gz

# Install initiad (for chain calls)
RUN curl -L "https://github.com/initia-labs/initia/releases/download/v1.4.3/initia_v1.4.3_Linux_x86_64.tar.gz" \
    -o /tmp/initiad.tar.gz && \
    tar xzf /tmp/initiad.tar.gz -C /usr/local/bin/ && \
    cp /usr/local/bin/*.so /usr/lib/ 2>/dev/null || true && \
    ldconfig && \
    rm /tmp/initiad.tar.gz

# Copy backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci
COPY backend/ ./
RUN npm run build
RUN npm prune --omit=dev

# Copy Move contracts
WORKDIR /app/move
COPY move/ ./

# Copy startup script and pre-configured minitia genesis
COPY deploy/start.sh /start.sh
COPY deploy/minitia-full.tar.gz /app/deploy/minitia-full.tar.gz
RUN chmod +x /start.sh

WORKDIR /app

EXPOSE 8080

CMD ["/start.sh"]
