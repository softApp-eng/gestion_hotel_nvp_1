# Use a tiny Nginx image
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY /dist/fuse/browser /usr/share/nginx/html

# Copy the custom nginx config to handle routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
