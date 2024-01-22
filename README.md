## Bắt đầu

**Môi trường, yêu cầu :**&#x20;

* nodejs (nên sử dụng node v18). Nếu server không hỗ trợ cài nodev16 có thể hạ cấp 
nextjs xuống 13.5.6 hoặc sử dụng docker thay cho pm2
* pm2: trình quản lý môi trường sản xuất cho node
* Cở sở dữ liệu: mysql

**Cài đặt :**

Cài đặt nodejs, có thể cài trực tiếp hoặc sử dụng [nvm ](https://github.com/nvm-sh/nvm)hoặc [fnm](https://github.com/Schniz/fnm).&#x20;

Sau đó tiếp tục cài pm2 trên toàn cầu bằng lệnh.

`npm i -g pm2`

Cài cài package cục bộ trong dự án (giống compoer install), và build project.

`npm i` && `npm run build`

**Sửa lỗi :**

Sử dụng trên VPS hay hosting mà báo lỗi `npm ERR! /usr/bin/env: node: Permission denied`. 
Hãy chạy lệnh `chown -R root:root .` cho thư mục public_html để cấp quyền 

**Sản xuất :**&#x20;

Copy nội dung project sang folder sản xuất (public_html) bằng hit hoặc zip file. 
(Lưu ý: git không bao gôm folder ./storage vì nặng, nên tải nên sau)

Import CSDL sang CSDL mới, nếu không có tạo CSDL mẫu bằng lệnh `npm run seed`

Chỉnh sửa file .env (Đường dẫn và bảng CSDL). Chỉnh sửa file package.json

> VD:  "start2": "next start -p 3001". Đổi port 3001 thành cổng sử dụng trong dự án
> Lưu ý:   Mỗi dự án phải chạy 1 cổng riêng biệt

Cấu hình file pm2 (nếu không chạy một scipt khác thì không cần thiết).

```json
{
  "apps": [
    {
      "name": "sample", // rename sample to project name
      "script": "npm",
      "args": "run start2" // run start2 in package.json
    }
  ]
}
```

Chạy lệnh `pm2 start pm2.json` để chạy dự án.

**Cấu hình nginx :**

Thêm `proxy_pass http://103.57.220.122:{port}` vào file nginx.conf và `client_max_body_size 100M` nếu cần thiết

Nếu sử dụng Direct Admin thì đường dẫn file nginx.còn sẽ là `/usr/local/directadmin/data/users/[user]/nginx.conf`

Chạy lại ngnix sau khi chỉnh sửa `sudo systemctl reload nginx` hoặc `sudo systemctl restart nginx`

VD: Một file cấu hình nginx.conf

```json
server
{
	listen 103.57.220.122:80;
	server_name vr360.kennatech.vn www.vr360.kennatech.vn ;
	access_log /var/log/nginx/domains/vr360.kennatech.vn.log;
	access_log /var/log/nginx/domains/vr360.kennatech.vn.bytes bytes;
	error_log /var/log/nginx/domains/vr360.kennatech.vn.error.log;
	root /home/media360/domains/vr360.kennatech.vn/public_html;
	index index.php index.html index.htm;
	include /usr/local/directadmin/data/users/media360/nginx_php.conf;
	location /
	{
    client_max_body_size 100M;
		# access_log off;
		proxy_buffering off;
		proxy_pass http://103.57.220.122:5173;
		proxy_set_header X-Client-IP      $remote_addr;
		proxy_set_header X-Accel-Internal /nginx_static_files;
		proxy_set_header Host             $host;
		proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
		proxy_hide_header Upgrade;
    return 301 https://vr360.kennatech.vn$request_uri;
	}
	location /nginx_static_files/
	{
		# access_log  /var/log/nginx/access_log_proxy;
		alias       /home/media360/domains/vr360.kennatech.vn/public_html/;
		internal;
	}
	include /etc/nginx/webapps.conf;
}

server
{
	listen 103.57.220.122:443 ssl http2;
	server_name vr360.kennatech.vn www.vr360.kennatech.vn ;
	access_log /var/log/nginx/domains/vr360.kennatech.vn.log;
	access_log /var/log/nginx/domains/vr360.kennatech.vn.bytes bytes;
	error_log /var/log/nginx/domains/vr360.kennatech.vn.error.log;
	root /home/media360/domains/vr360.kennatech.vn/private_html;
	index index.php index.html index.htm;
	ssl_certificate /usr/local/directadmin/data/users/media360/domains/vr360.kennatech.vn.cert.combined;
	ssl_certificate_key /usr/local/directadmin/data/users/media360/domains/vr360.kennatech.vn.key;
	include /usr/local/directadmin/data/users/media360/nginx_php.conf;
	location /
	{
    client_max_body_size 100M;
		# access_log off;
		proxy_buffering off;
		proxy_pass http://103.57.220.122:5173;
		proxy_set_header X-Client-IP      $remote_addr;
		proxy_set_header X-Accel-Internal /nginx_static_files;
		proxy_set_header Host             $host;
		proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
		proxy_hide_header Upgrade;
	}
	location /nginx_static_files/
	{
		# access_log  /var/log/nginx/access_log_proxy;
		alias       /home/media360/domains/vr360.kennatech.vn/private_html/;
		internal;
	}
	include /etc/nginx/webapps.ssl.conf;
}
```