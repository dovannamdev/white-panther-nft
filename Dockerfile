# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

# Write .env with deployed contract address for Vite build
RUN echo "VITE_NFT_CONTRACT_ADDRESS=0x206F431abCEdd9E5022E55BE834CAE9a31d95cC6" > .env && \
    echo "VITE_TARGET_CHAIN_ID=421614" >> .env

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: redirect all routes to index.html
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
