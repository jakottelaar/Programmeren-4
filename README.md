# Share a meal API

This is a simple API developed as part of a school project. It provides endpoints to perform basic CRUD (Create, Read, Update, Delete) operations on a data resource. The API is built using Node.js and Express, and it utilizes various libraries for different functionalities.

### Getting started

To get started with the project API, follow these steps:

#### Prerequisites
* Node.js (version 18)
* MySQL database

#### Libraries Used
This project utilizes the following libraries:

* Chai: Assertion library for testing.
* Mocha: JavaScript test framework.
* jsonwebtoken: Library for generating and verifying JSON Web Tokens (JWT).
* Joi: Validation library for validating data.
* mysql: MySQL driver for Node.js.
* mysql2: MySQL client for Node.js with improved performance.
* express: Web framework for building APIs.
* tracer: Logging library for generating logs.
* dotenv: Library for loading environment variables from a .env file.
* bcrypt: Library for hashing passwords and comparing hashed passwords for secure password storage.

#### Installation

1. Clone this repository to your local machine.
2. Install the dependencies by running npm install.
3. Set up the necessary environment variables. Refer to the .env.example file for the required variables.
4. Start the API server by running node app.js .
5. The API will be accessible at http://localhost:3000.

#### Configuration
1. Create a .env file in the root directory of the project.
2. Configure the following environment variables in the .env file:

```
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_DATABASE=database_name
JWT_SECRET_KEY=your_secret_key
```
### API Documentation
To understand the available endpoints and their functionalities, please refer to the API documentation created with Postman.
https://documenter.getpostman.com/view/26588588/2s93m1b5Fe
