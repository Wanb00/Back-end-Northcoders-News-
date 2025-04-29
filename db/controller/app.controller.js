const endpoints = require('../../endpoints.json');
const { selectTopics, selectArticleById, selectArticles, selectCommentsByArticle, insertCommentByArticle, selectOwnerByIdToUpdate } = require('../models/app.model');

const getEndpoints = (req, res, next) => {
    res.status(200).send({ endpoints });
};

const getTopics = (req, res, next) => {
    return selectTopics()
        .then((topics) => {
            res.status(200).send({ topics });
        });
};

const getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    return selectArticleById(article_id).then((article) => {
        res.status(200).send({ article });
    }).catch((err) => next(err));
};

const getArticles = (req, res, next) => {
    return selectArticles().then((articles) => {
        res.status(200).send({ articles });
    });
};

const getCommentsByArticle = (req, res, next) => {
    const { article_id } = req.params;
    return selectCommentsByArticle(article_id).then((comments) => {
        res.status(200).send({ comments });
    }).catch((err) => next(err));
}

const postCommentByArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;
    insertCommentByArticle(article_id, username, body).then((comment) => {
        res.status(201).send({ comment });
      }).catch((err) => next(err));
  }

const updateArticleById = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    return selectOwnerByIdToUpdate(article_id, inc_votes).then((article) => {
        res.status(200).send({ article });
    }).catch((err) => next(err));
}

module.exports = { getEndpoints, getTopics, getArticleById, getArticles, getCommentsByArticle, postCommentByArticle, updateArticleById };