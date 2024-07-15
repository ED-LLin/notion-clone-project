# Social Content Note with Auto AI tagging

A note-taking application that allows users to store and manage social media data efficiently with AI.

You can now visit the application at [notion-clone.com](https://notion-clone.com)


## Table of contents
- [Language and Tools](#language-and-tools)
- [Techniques](#techniques)
- [Features Demo](#features-demo)
- [Requirements](#requirements)
- [API Documentation](#api-documentation)


## Language and Tools
[![Skills and Tools](https://skillicons.dev/icons?i=nodejs,express,mongodb,redis,html,tailwind,aws,nginx,docker,)](https://skillicons.dev)

- Backend
    - Node.js
    - Express.js
    - method-override

- Frontend
    - EJS
    - TailwindCSS

- Infrastructure
    - AWS EC2
    - NGINX
    - Docker, Docker Compose

- Database
    - MongoDB
    - Mongoose
    - Redis

- Authentication
    - Passport.js
    - express-session
    - MongoStore

- Configuration
    - dotenv

- APIs
    - Rapid API
    - OpenAI API

## Techniques
#### 💡 Brief Architecture
![Infrastructure](public/img/README-Infrastructure.png)
#### 💡 Sequence diagram of fetching content through URL
![fetching social content sequence diagram](public/img/README-Social_URL_dataflow.png)

## Features Demo
#### 1. GoogleAuth
![Google Login](public/img/README-GoogleAuth.gif)
#### 2. Fetch Social Content And Auto AI Tagging
![Fetch Content](public/img/README-Fetch_Social_Content.gif)
Currently, the application supports fetching content from Instagram and YouTube.
### 3. Add Personal Note
![Add Note](public/img/README-Add_Note.gif)

## Requirements
- Node.js >= 14.0.0
- MongoDB

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/notion-clone-project.git
   cd notion-clone-project
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```env
    PORT=3000
    MONGODB_URI=
    GOOGLE_CLIENT_ID=
    GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback
    SESSION_SECRET=
    REDIS_URL=redis://localhost:6379
    x_rapidapi_key=
    OPENAI_API_KEY=
   ```


## API Documentation
This project includes Swagger API documentation. To access the API docs, navigate to [notionclone.com/api-docs](http://notionclone.com/api-docs) in your browser. The documentation provides detailed information on user authentication, note management, and search functionalities.