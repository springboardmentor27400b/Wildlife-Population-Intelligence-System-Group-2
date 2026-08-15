FROM python:3.11

WORKDIR /app

# Force CPU execution
ENV CUDA_VISIBLE_DEVICES=""
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1

# Required for audio processing / ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy application and AI models
COPY app ./app
COPY models ./models

# Create upload directories
RUN mkdir -p /app/uploads
RUN mkdir -p /app/uploads/annotated
RUN mkdir -p /app/uploads/audio

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]