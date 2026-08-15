FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG VITE_API_BASE_URL=http://localhost:8080

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


FROM node:20-slim

WORKDIR /app

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]