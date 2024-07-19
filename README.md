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
### 💡 Brief Architecture
![Infrastructure](public/img/README-Infrastructure.png)
### 💡 Sequence diagram of fetching content through URL
![fetching social content sequence diagram](public/img/README-Social_URL_dataflow.png)
### 💡 Social Content ETL Process
![Social Content ETL](public/img//README-ETL_Process.png)
### 💡 CI/CD Process
![CI/CD Process](public/img/README-CI:CD.png)

## Test Results
### 💡 Social Content Fetcher Controller Unit Test Result

The unit tests for the `fetcherController` utilize Jest to ensure the robustness and reliability of the code. Here are some key points:
- **Mock Functions**: Use `jest.mock` to mock database models and dependencies.
- **Mock Redis Client**: Dynamically mock `redisClient` and its methods.
- **Mock Mongoose**: Mock `ObjectId.isValid` method to check ObjectId validity.
- **Testing Different Scenarios**: Write multiple test cases for each controller method.
- **Simulating HTTP Requests and Responses**: Use `req` and `res` objects to simulate HTTP requests and responses.

#### Test Coverage Report

The following table provides an overview of the test coverage for the project:


File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------|---------|----------|---------|---------|-------------------
All files              |   95.45 |    97.43 |      80 |   95.45 |                   
 controllers           |   99.31 |    97.43 |     100 |   99.31 |                   
  fetcherController.js |   99.31 |    97.43 |     100 |   99.31 | 74                
 etl                   |   23.07 |      100 |       0 |   23.07 |                   
  load.js              |   23.07 |      100 |       0 |   23.07 | 4-13              
 models                |     100 |      100 |     100 |     100 |                   
  SocialData.js        |     100 |      100 |     100 |     100 |                   
  User.js              |     100 |      100 |     100 |     100 |                   


### Insights and Recommendations from Test Coverage

- **Overall Coverage**: High coverage with 95.45% statements, 97.43% branches, 80% functions, and 95.45% lines.
- **Controllers**: Excellent coverage in `fetcherController.js` with 99.31% statements, 97.43% branches, 100% functions, and 99.31% lines; only line 74 uncovered.
- **ETL**: Low coverage in `etl/load.js` with 23.07% statements and lines; all branches covered, no functions tested, lines 4-13 uncovered.
- **Models**: Perfect coverage in `SocialData.js` and `User.js` with 100% statements, branches, functions, and lines.

**Future Improvements**:
- Improve ETL tests by increasing coverage for `etl/load.js`, ensuring all functions are tested, and addressing lines 4-13.
- Add a test case to cover line 74 in `fetcherController.js` for more coverage in Controller.


## Features Demo
### 1. GoogleAuth
![Google Login](public/img/README-GoogleAuth.gif)
### 2. Fetch Social Content And Auto AI Tagging
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