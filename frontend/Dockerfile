FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
ENV VITE_API_URL=http://localhost:3000
CMD ["npm", "run", "dev"]
