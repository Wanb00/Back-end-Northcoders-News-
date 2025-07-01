const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate } = require("./utils");
const bcrypt = require("bcrypt");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users`);
    })
    .then(() => {
      return db.query(`
    CREATE TABLE topics (
      slug VARCHAR PRIMARY KEY,
      description VARCHAR NOT NULL,
      img_url VARCHAR(1000)
      );
        `);
    })
    .then(() => {
      return db.query(`
    CREATE TABLE users (
      username VARCHAR PRIMARY KEY,
      name VARCHAR NOT NULL,
      avatar_url VARCHAR(1000),
      password TEXT NOT NULL
      );
        `);
    })
    .then(() => {
      return db.query(`
    CREATE TABLE articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR NOT NULL,
      topic VARCHAR REFERENCES topics(slug),
      author VARCHAR REFERENCES users(username),
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      votes INT DEFAULT 0,
      article_img_url VARCHAR(1000)
      );
        `);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        author VARCHAR REFERENCES users(username),
        article_id INT REFERENCES articles(article_id),
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        body TEXT NOT NULL
      );
        `);
    })
    .then(() => {
      const topicValues = topicData.map(({ slug, description, img_url }) => [
        slug,
        description,
        img_url,
      ]);
      const query = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING *`,
        topicValues
      );
      return db.query(query);
    })
    .then(() => {
      const saltRounds = 10;

      return Promise.all(
        userData.map(async ({ username, name, avatar_url, password }) => {
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          return [username, name, avatar_url, hashedPassword];
        })
      ).then((userValues) => {
        const query = format(
          `INSERT INTO users (username, name, avatar_url, password) VALUES %L RETURNING *;`,
          userValues
        );
        return db.query(query);
      });
    })
    .then(() => {
      const formattedArticles = articleData.map(convertTimestampToDate);
      const articleValues = formattedArticles.map(
        ({
          title,
          topic,
          author,
          body,
          created_at,
          votes,
          article_img_url,
        }) => [title, topic, author, body, created_at, votes, article_img_url]
      );
      const query = format(
        `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;`,
        articleValues
      );
      return db.query(query);
    })
    .then(({ rows: insertedArticles }) => {
      const articleIdLookup = {};
      insertedArticles.forEach((article) => {
        articleIdLookup[article.title] = article.article_id;
      });

      const formattedComments = commentData.map(convertTimestampToDate);
      const commentValues = formattedComments.map(
        ({ body, article_title, created_at, votes, author }) => [
          articleIdLookup[article_title],
          body,
          votes,
          author,
          created_at,
        ]
      );

      const query = format(
        `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L RETURNING *;`,
        commentValues
      );

      return db.query(query);
    });
};
module.exports = seed;
