# Usa uma imagem oficial do Node
FROM node:18-alpine

# Cria diretório dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Builda o projeto para produção
RUN npm run build

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando para rodar o Next.js
CMD ["npm", "start"]
