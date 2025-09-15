FROM node:18-alpine3.20

# Install xdg-utils (BTCPay Server mod)
RUN apk add --no-cache bash xdg-utils git
# Install Shopify CLI globally (BTCPay Server mod)
RUN npm install -g @shopify/cli@3.84.1

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm install && npm ci --omit=dev && npm cache clean --force

COPY . .
RUN npm install && npm cache clean --force
ENTRYPOINT ["/app/docker-entrypoint.sh"]
