# Use a imagem base do Node.js
FROM node:latest

# Diretório de trabalho dentro da imagem
WORKDIR /app

# Copie os arquivos do aplicativo para dentro da imagem
COPY package.json package-lock.json /app/

# Instale as dependências
RUN npm ci --only=production

# Copie o restante dos arquivos do aplicativo
COPY . /app/

# Expor a porta do aplicativo
EXPOSE 3000

# Comando para instalar as dependências
COPY install-dependencies.sh /app/
RUN chmod +x /app/install-dependencies.sh
RUN /app/install-dependencies.sh


# Comando para construir o aplicativo
RUN npm run build

# Configuração das variáveis de ambiente
ARG AI_SELECTED
ARG GEMINI_KEY
ARG GEMINI_PROMPT

ENV AI_SELECTED=$AI_SELECTED
ENV GEMINI_KEY=$GEMINI_KEY
ENV GEMINI_PROMPT=$GEMINI_PROMPT

# Comando para iniciar o aplicativo
CMD ["npm", "start"]
