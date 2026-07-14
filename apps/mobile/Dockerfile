FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN pnpm install
COPY . .
RUN ln -s /app/apps/mobile/App.tsx /app/App.tsx
WORKDIR /app/apps/mobile
ENV EXPO_PUBLIC_API_URL=/api
RUN npx expo export --platform web

FROM nginx:alpine
COPY --from=0 /app/apps/mobile/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
