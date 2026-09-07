FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/requirements-production.txt server/requirements-production.txt
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements-production.txt
COPY . .
ENV CHORDSYNC_RUNTIME_DIR=/tmp/chordsync-runtime CHORDSYNC_MAX_CONCURRENT_INFERENCE=1
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health',timeout=3)" || exit 1
CMD ["uvicorn","server.main:app","--host","0.0.0.0","--port","8000","--workers","1","--proxy-headers"]
