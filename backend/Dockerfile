FROM python:3.11-slim

# 파이썬 출력 버퍼링 끔
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 의존성 먼저 복사 (캐시 최적화)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY . .

# FastAPI 실행 (외부 접근 가능하도록 0.0.0.0)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]