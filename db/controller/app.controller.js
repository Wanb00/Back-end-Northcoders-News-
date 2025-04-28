const endpoints = require('../../endpoints.json');
const { selectTopics, selectArticleById,  } = require('../models/app.model')

const getEndpoints = (req, res, next) => {
    res.status(200).send({ endpoints });
}

const getTopics = (req, res, next) => {
    return selectTopics()
        .then((topics) => {
            res.status(200).send({ topics })
        })
}

const getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    return selectArticleById(article_id).then((article) => {
        res.status(200).send({ article })
    }).catch((err) => next(err))
}

module.exports = { getEndpoints, getTopics, getArticleById }