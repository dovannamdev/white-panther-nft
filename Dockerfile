# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

ARG VITE_NFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ARG VITE_TARGET_CHAIN_ID=421614
ENV VITE_NFT_CONTRACT_ADDRESS=$VITE_NFT_CONTRACT_ADDRESS
ENV VITE_TARGET_CHAIN_ID=$VITE_TARGET_CHAIN_ID

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: redirect all routes to index.html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
