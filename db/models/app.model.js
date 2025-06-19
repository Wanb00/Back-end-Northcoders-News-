const db = require("../connection");

const selectTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    return result.rows;
  });
};

const selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count
                FROM articles
                LEFT JOIN comments ON comments.article_id = articles.article_id
                WHERE articles.article_id = $1
                GROUP BY articles.article_id;`,
      [article_id]
    )
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return result.rows[0];
    });
};

const selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBy = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  const validOrders = ["asc", "desc"];

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }
  if (!validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  const queryValues = [];
  let queryStr = `
        SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
        COUNT(comments.comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
      `;

  if (topic) {
    queryValues.push(topic);
    queryStr += `WHERE articles.topic = $1 `;
  }

  queryStr += `GROUP BY articles.article_id
                   ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr, queryValues).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Topic Not Found!" });
    }
    return result.rows;
  });
};

const selectCommentsByArticle = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY comments.created_at DESC;`,
      [article_id]
    )
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return result.rows;
    });
};

const insertCommentByArticle = (article_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request, Missing required fields",
    });
  }
  return db
    .query(`SELECT * FROM comments WHERE article_id = $1`, [article_id])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return db.query(
        `INSERT INTO comments (author, body, article_id)VALUES ($1, $2, $3) RETURNING comment_id, votes, created_at, author, body, article_id;`,
        [username, body, article_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};

const selectArticleByIdToUpdate = (article_id, inc_votes) => {
  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request inc_votes must be a number",
    });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article Not Found" });
      }
      return result.rows[0];
    });
};

const selectCommentToDelete = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *`, [
      comment_id,
    ])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment Not Found" });
      }
    });
};

const selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => result.rows);
};

const insertArticle = (
  title,
  topic,
  author,
  body,
  article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
) => {
  return db
    .query(
      `INSERT INTO articles (title, topic, author, body, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, topic, author, body, article_img_url]
    )
    .then((result) => {
      return result.rows[0];
    });
};

const selectUserByUsername = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then((result) => {
      if (!result.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "username not found!",
        });
      }
      return result.rows[0];
    });
};

module.exports = {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectCommentsByArticle,
  insertCommentByArticle,
  selectArticleByIdToUpdate,
  selectCommentToDelete,
  selectUsers,
  insertArticle,
  selectUserByUsername,
};
