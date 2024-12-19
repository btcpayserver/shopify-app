FROM node:18-alpine3.20

# Install xdg-utils (BTCPay Server mod)
RUN apk add --no-cache xdg-utils
# Install Shopify CLI globally (BTCPay Server mod)
RUN npm install -g @shopify/cli@latest

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
###RUN npm remove @shopify/cli

COPY . .

RUN npm run build

CMD ["npm", "run", "docker-start"]
