const endpoints = require('../../endpoints.json');
const { selectTopics } = require('../models/app.model')

const getEndpoints = (req, res, next) => {
    res.status(200).send({ endpoints });
}

const getTopics = (req, res, next) => {
    return selectTopics()
        .then((topics) => {
            //console.log( { topics })
            res.status(200).send({ topics })
        })
}

module.exports = { getEndpoints, getTopics }