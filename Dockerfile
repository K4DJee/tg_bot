# Базовый образ (Alpine-based)
FROM node:20-alpine

# Установка зависимостей для Chrome
RUN apk add --no-cache \
    wget \
    gnupg \
    ca-certificates \
    fontconfig \
    libappindicator \
    alsa-lib \
    atk \
    at-spi2-atk \
    cairo \
    cups \
    dbus \
    expat \
    gdk-pixbuf \
    glib \
    gtk+3.0 \
    libx11 \
    libxcomposite \
    libxcursor \
    libxdamage \
    libxext \
    libxfixes \
    libxi \
    libxrandr \
    libxrender \
    libxss \
    libxtst \
    nss \
    pango \
    && rm -rf /var/cache/apk/*

# Установка Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apk add --no-cache libstdc++ \
    && dpkg -i google-chrome-stable_current_amd64.deb || apk add --no-cache --virtual .chrome-deps \
    && rm google-chrome-stable_current_amd64.deb

# Создание рабочей директории
WORKDIR /app

# Копирование файлов проекта
COPY package*.json ./
RUN npm install
COPY . .

# Команда для запуска бота
CMD ["node", "bot.js"]
