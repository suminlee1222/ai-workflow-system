# 1) 빌드 단계
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 2) 실행 단계
FROM node:18-alpine

WORKDIR /app

# 빌드 산출물만 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 외부 접근 허용
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# 프로덕션 실행
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
