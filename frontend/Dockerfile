# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 1. ÖNCE sadece lock dosyalarını kopyala (package.json değişmezse bu katman cache'lenir)
COPY package.json package-lock.json ./

# npm ci: lock dosyasından birebir kurar, npm install'dan %30 daha hızlı
# --prefer-offline: mümkünse yerel cache kullanır
RUN npm ci --prefer-offline

# 2. SONRA kaynak kodu kopyala
COPY . .

# Build-time env değişkenleri
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG VITE_WS_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ── Stage 2: Runtime (nginx) ───────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
