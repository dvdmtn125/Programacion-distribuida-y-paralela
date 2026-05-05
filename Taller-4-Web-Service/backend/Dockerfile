FROM python:3.12-slim

# Define la carpeta de trabajo dentro del contenedor del backend.
WORKDIR /app

# Evita archivos pyc innecesarios y mejora el log en consola.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copia e instala las dependencias del backend.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el codigo fuente de FastAPI al contenedor.
COPY app ./app

# Expone el backend en todas las interfaces para que Docker pueda publicarlo.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
