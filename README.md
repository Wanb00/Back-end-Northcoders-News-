# Back-end server project
## Summary
This back-end project aims to host an accessible server that will aim to replicate a news webpage containing information in database tables like users, articles, comments, and authors.
To accomplish this project, the following were used to build the code:
1. JavaScript
2. postgreSQL
3. Jest & supertest
4. Express
5. Render (server)
6. Supabase (database)
### Link to the hosted version: https://back-end-northcoders-news.onrender.com

## Cloning
1. Clone using HTTPS by clicking the code<> drop down and copying the url.
2. Head to your terminal and use git clone "copied URL"

## Setup
1. Use npm install to install all dependencies
2. Then run npm setup-dbs to setup the databases and then npm seed-dev to setup the tables and test information
3. Tests can be run via "npm t filePath" or just npm t if you want to run ALL tests
4. Create two .env files .env.development and .env.test, sets up database connections
5. .env.test should have the following code: PGDATABASE=nc_news_test
6. .env.development should have the following code: PGDATABASE=nc_news

## Versions
Node.js v23.8.0
Postgres 16.8

