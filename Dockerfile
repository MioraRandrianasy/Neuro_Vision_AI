# Use an official lightweight Python runtime
FROM python:3.10-slim

# Set environment variables ensuring logs output smoothly and pyc caching is off
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install python dependencies securely
COPY requirements.txt /app/backend/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of the application
COPY . /app/

# Open the binding container port
EXPOSE 8000

# Execute Uvicorn server matching FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
