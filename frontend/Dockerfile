FROM node:22.17.0-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install #--frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .

ENV NODE_ENV=production

RUN yarn build

# -----
FROM nginx:1.29-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
