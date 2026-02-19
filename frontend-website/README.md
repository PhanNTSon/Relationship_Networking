# Relationship Networking Frontend
Ứng dụng frontend xây dựng bằng [React](https://react.dev/) và [Vite](https://vitejs.dev/).


## Architechure
* **src/**:  code React
* **public/**: assets tĩnh

## Design
### Login page
Được thiết kế theo giao diện riêng, gọi API quản lý của *AWS Cognito* cung cấp. 

### Main page
Trang này thiết kế 2 lớp (*layers*). Được chứa trong 1 thẻ *div* đóng vai trò là **container**. 
#### 1. Vietnam Map
Lớp đầu tiên là Map. Là một SVG full màn được Gen ra bởi thư viện **React simple maps**.

#### 2. Tools & Options
Lớp thứ 2 nằm ở trên chứa các tiện ích. Những tiện ích này sẽ **hiển thị**/ **ẩn đi** tùy tình huống:
* **Hiển thị**: mặc định.
* **Ẩn đi**: khi bấm vào xem thông tin của 1 Person trên Map.

### Dashboard page
Trang quản lý người dùng, sử dụng API quản lý của *AWS Cognito* cung cấp.

## Deploy
Frontend được deploy lên Vercel.