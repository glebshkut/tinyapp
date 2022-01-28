# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la [bit.ly](https://bitly.com/)).

## Final Product
***Login page***
![](./docs/login_page.png)
***My URLs page***
![](./docs/my_urls.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- cookie-parser

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Features:
- Page of URLs, available for a particular user
![](./docs/my_url.png)

- Creating a new tinyURL
![](./docs/new_tinyUrl.png)

- Editing tinyURLs
![](./docs/url_edit.png)

- Accessing longURL via tinyURL
![](./docs/u_shortID.png)
To access your URL type in `http://localhost:8080/u/`:shortURL