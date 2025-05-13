FROM python:3.9-slim

WORKDIR /app

# Create non-root user for security
RUN groupadd -r scraper && useradd -r -g scraper scraper

# Copy only essential files
COPY tools/home-depot-scraper/requirements.txt .
COPY tools/home-depot-scraper/run.py .
COPY tools/home-depot-scraper/api_diagnostics_handler.py .
COPY tools/home-depot-scraper/api_routes.py .
COPY tools/home-depot-scraper/templates/ ./templates/
COPY tools/home-depot-scraper/static/ ./static/
COPY tools/home-depot-scraper/config/ ./config/
COPY tools/home-depot-scraper/db/ ./db/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create data directories
RUN mkdir -p /app/data/raw /app/data/results /app/data/lowes/raw /app/data/lowes/results && \
    chmod -R 777 /app/data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV FLASK_ENV=production

# Expose the port
EXPOSE 8080

# Switch to non-root user
USER scraper

# Command to run the application
CMD ["python", "run.py"]