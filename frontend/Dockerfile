FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build para producción
RUN npm run build
EXPOSE 3000
# Usar start en lugar de dev para producción
CMD ["npm", "start"]
