# 使用一個基礎映像，例如 Node.js
FROM node:latest

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製補丁文件並應用補丁
COPY patches ./patches
RUN npx patch-package

# 複製應用程式碼
COPY . .

# 暴露應用運行的端口
EXPOSE 3000

# 定義容器啟動時要執行的命令
CMD ["npm", "start"]