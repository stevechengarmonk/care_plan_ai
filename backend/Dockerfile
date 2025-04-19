# Dockerfile — Flask API container
FROM python:3.10-slim
WORKDIR /app
COPY . /app

# Install required packages
RUN pip install flask flask-cors fpdf google-generativeai

# Expose API port
EXPOSE 5000

CMD ["python", "app.py"]
