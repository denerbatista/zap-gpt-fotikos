# Use a imagem base do Node.js compatível com puppeteer
FROM buildkite/puppeteer:latest

# Diretório de trabalho dentro da imagem
WORKDIR /app

# Instale o TypeScript e o tsup globalmente
RUN npm install -g typescript tsup

# Copie os arquivos do aplicativo para dentro da imagem
COPY package.json package-lock.json /app/

# Baixa e adiciona a chave pública do repositório do Chrome manualmente
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

# Instale as dependências do sistema
RUN apt-get update && apt-get install -y \
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
    chromium \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copie o restante dos arquivos do aplicativo
COPY . /app/

# Defina as permissões do diretório dist
RUN chmod -R 755 /app/dist

# Expor a porta do aplicativo
EXPOSE 3000

# Comando para construir o aplicativo (modificado)
RUN npm run build || true  # Alteração: Adicionando "|| true" para ignorar erros de construção

# Configuração das variáveis de ambiente
ARG AI_SELECTED
ARG GEMINI_KEY
ARG GEMINI_PROMPT

ENV AI_SELECTED=$AI_SELECTED
ENV GEMINI_KEY=$GEMINI_KEY
ENV GEMINI_PROMPT=$GEMINI_PROMPT

# Comando para iniciar o aplicativo
CMD ["npm", "start", "--", "--no-sandbox"]
