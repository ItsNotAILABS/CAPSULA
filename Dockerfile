FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CAPSULA_HOST=0.0.0.0 \
    CAPSULA_PORT=8784

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-platform.txt requirements-platform.txt
RUN python -m pip install --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements-platform.txt

COPY capsula capsula
COPY capsules capsules
COPY docs docs
COPY README.md README.md

EXPOSE 8784

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python - <<'PY'
import urllib.request
urllib.request.urlopen('http://127.0.0.1:8784/health', timeout=3).read()
PY

CMD ["python", "-m", "capsula.cli", "api", "--host", "0.0.0.0", "--port", "8784"]
