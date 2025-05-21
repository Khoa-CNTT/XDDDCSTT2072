# Sử dụng Node.js làm base image
FROM node:18-alpine as build

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --legacy-peer-deps

# Sao chép toàn bộ source code
COPY . .

# Build ứng dụng
RUN npm run build

# Stage 2: Chạy ứng dụng với Nginx
FROM nginx:alpine

# Sao chép file build từ stage trước vào thư mục root của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Sao chép cấu hình Nginx (tùy chọn)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"] 