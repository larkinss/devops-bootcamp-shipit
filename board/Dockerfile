# --- build the client ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY vite.config.js ./
COPY client ./client
RUN npm run build

# --- runtime ---
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY src ./src
COPY --from=build /app/dist ./dist
EXPOSE 3000
ENV PORT=3000
CMD ["node", "src/index.js"]
