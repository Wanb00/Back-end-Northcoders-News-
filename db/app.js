const express = require("express");
const app = express();
const {
  getEndpoints,
  getTopics,
  getArticleById,
  getArticles,
  getCommentsByArticle,
  postCommentByArticle,
  updateArticleById,
  deleteCommentById,
  getUsers,
  postArticle,
  getUserByUsername,
  getArticlesByAuthor,
  updateCommentById,
} = require("./controller/app.controller");
const { login, authenticate } = require("./controller/login.controller");
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/users/:user/articles", getArticlesByAuthor);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.get("/api/users", getUsers);

app.get("/api/users/:username", getUserByUsername);

app.get("/api/secure-data", authenticate, (req, res) => {
  res.send({ data: "Secret stuff for " + req.user.username });
});

app.post("/api/articles/:article_id/comments", postCommentByArticle);

app.post("/api/articles", postArticle);

app.post("/api/login", login);

app.patch("/api/articles/:article_id", updateArticleById);

app.patch("/api/comments/:comment_id", updateCommentById);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("/*splat", (req, res) => {
  res.status(404).send({ msg: "Not Found!" });
});
//End of express chain ^^
//Start of error handling middleware chain

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid ID Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

module.exports = app;
