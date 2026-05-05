FROM node:20-alpine

# Define la carpeta de trabajo dentro del contenedor del frontend.
WORKDIR /app

# Copia primero el manifiesto para instalar dependencias.
COPY package*.json ./
RUN npm install

# Copia el resto del proyecto React.
COPY . .

# Levanta Vite escuchando en todas las interfaces del contenedor.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
