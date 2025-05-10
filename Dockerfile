FROM nginx:alpine

# Create a simple HTML file
RUN mkdir -p /usr/share/nginx/html
RUN echo '<html>\
<head>\
  <title>FAIT Co-op</title>\
  <style>\
    body {\
      font-family: Arial, sans-serif;\
      margin: 0;\
      padding: 0;\
      display: flex;\
      justify-content: center;\
      align-items: center;\
      height: 100vh;\
      background-color: #f5f5f5;\
    }\
    .container {\
      text-align: center;\
      padding: 2rem;\
      background-color: white;\
      border-radius: 8px;\
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);\
      max-width: 800px;\
    }\
    h1 {color: #4285F4;}\
    p {color: #5f6368; margin-bottom: 1.5rem; line-height: 1.6;}\
    .button {\
      background-color: #4285F4;\
      color: white;\
      padding: 0.75rem 1.5rem;\
      border-radius: 4px;\
      text-decoration: none;\
      display: inline-block;\
      margin-top: 20px;\
    }\
    .button:hover {background-color: #3367d6;}\
  </style>\
</head>\
<body>\
  <div class="container">\
    <h1>Welcome to FAIT Co-op</h1>\
    <p>Our full website is currently under development and will be launching soon.</p>\
    <p>FAIT Co-op is a platform connecting contractors, clients, and service agents to streamline construction and home service projects.</p>\
    <p>We are working hard to bring you a seamless experience for managing your projects, finding trusted professionals, and collaborating effectively.</p>\
    <p>For more information or to join our early access program, please contact us.</p>\
    <a href="mailto:info@itsfait.com" class="button">Contact Us</a>\
  </div>\
</body>\
</html>' > /usr/share/nginx/html/index.html

# Remove the default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Create a new nginx configuration file
RUN echo 'server {\
    listen 8080;\
    server_name localhost;\
    location / {\
        root /usr/share/nginx/html;\
        index index.html index.htm;\
    }\
}' > /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Set the PORT environment variable to 8080 by default
ENV PORT 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

ENTRYPOINT ["/docker-entrypoint.sh"]
