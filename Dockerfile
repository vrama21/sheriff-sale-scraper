FROM node:alpine

WORKDIR /app

# COPY package.json and package-lock.json files
COPY package*.json ./
# generated prisma files
COPY prisma ./prisma/
# COPY ENV variable
COPY .env ./
# COPY tsconfig.json file
COPY tsconfig.json ./
# COPY
COPY . .

RUN npx prisma generate
RUN npx prisma migrate dev

EXPOSE 3000