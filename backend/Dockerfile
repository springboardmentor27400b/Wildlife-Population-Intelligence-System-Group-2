FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=120 \
    PIP_RETRIES=10

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libglib2.0-0 \
    libgl1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libsndfile1 \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --upgrade pip "setuptools<81" wheel

# Install CPU-only PyTorch
RUN set -eux; \
        ok=0; \
        for i in 1 2 3 4 5; do \
      pip install --no-cache-dir --retries 10 --timeout 120 --prefer-binary \
      --index-url https://download.pytorch.org/whl/cpu \
            torch==2.4.1 torchvision==0.19.1 && ok=1 && break; \
      echo "PyTorch install failed (attempt ${i}), retrying..."; \
        done; \
        [ "$ok" -eq 1 ]

# Install remaining dependencies
RUN pip install --no-cache-dir --retries 10 --timeout 120 --prefer-binary \
    -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]