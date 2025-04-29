const db = require('./connection');
const express = require('express');
const app = express();
const { getEndpoints, getTopics, getArticleById, getArticles, getCommentsByArticle } = require('./controller/app.controller');

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/topics', getTopics);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getCommentsByArticle)

app.all('/*splat', (req, res) => {
    res.status(404).send({ msg: 'Not Found!' });
});
//End of express chain ^^
//Start of error handling middleware chain

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg:'Invalid ID Bad Request' });
    } else {
        next(err);
    };
});

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    };
});

module.exports = app;