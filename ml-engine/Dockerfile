FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for SpaCy
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download SpaCy model
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
