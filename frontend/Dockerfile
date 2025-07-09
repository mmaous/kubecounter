FROM node:22.17.0-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .

ARG API_URL=http://localhost:8080
ENV NODE_ENV=production
ENV VITE_API_URL=$API_URL

RUN yarn build

FROM nginx:1.29-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
