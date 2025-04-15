# NC News Seeding

Instructions on cloning this repo.
  - setup databases required by running the script "npm run setup-dbs"
  - .env files are missing so create a .env.test file and .env.development file
  - test file should contain PGDATABASE=nc_news_test whereas development should be PGDATABASE=nc_news this helps to differentiate running code in for test or development
  - npm run test-seed and npm run seed-dev should be tested to check that the console logs an output stating you are connected to the correct databases
