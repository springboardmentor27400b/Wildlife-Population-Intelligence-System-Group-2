FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV DATABASE_URL="sqlite:///./wildlife.db"
ENV HF_HUB_OFFLINE="1"
ENV TRANSFORMERS_OFFLINE="1"

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
