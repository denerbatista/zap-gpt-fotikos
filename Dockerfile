# Use uma imagem base do Node.js compatível com puppeteer
FROM node:slim

# Adiciona um usuário não-root
RUN groupadd -r myuser && useradd -r -g myuser myuser

# Define o diretório de trabalho dentro da imagem
WORKDIR /app

# Copie os arquivos do aplicativo para dentro da imagem
COPY package.json /app/

# Instale as dependências do Node.js
RUN npm install

# Substitua o arquivo create-config.js na pasta node_modules pelo seu arquivo personalizado
COPY create-config.js /app/node_modules/@wppconnect-team/wppconnect/dist/config/

# Instale o TypeScript e o tsup globalmente
RUN npm install -g typescript tsup

# Instale as dependências do sistema
RUN apt-get update \
    && apt-get install -y \
        libnss3 \
        ca-certificates \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgbm1 \
        libgcc1 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        wget \
        xdg-utils \
        curl \
        gnupg \
    --no-install-recommends \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install google-chrome-stable -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


# Copie o restante dos arquivos do aplicativo
COPY . /app/

# Defina as permissões
RUN chown -R myuser:myuser /app

# Comando para construir o aplicativo (modificado)
RUN su myuser -c "npm run build"

# Defina as permissões para o Chrome
RUN chown myuser:myuser /usr/bin/google-chrome

# Adicione uma etapa para criar o arquivo Last Browser
RUN mkdir -p /app/tokens/sessionName \
    && echo "/usr/bin/google-chrome/chrome.exe" > /app/tokens/sessionName/Last\ Browser

# Expor a porta do aplicativo
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["npm", "start"]
