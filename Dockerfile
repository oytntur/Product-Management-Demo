FROM nginx:latest
COPY ./dist/sabahyildizi-interview-1/browser /usr/share/nginx/html
COPY ./nginx.config /etc/nginx/conf.d/default.conf
EXPOSE 80 443