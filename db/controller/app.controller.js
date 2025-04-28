const endpoints = require('../../endpoints.json');

const getEndpoints = (req, res, next) => {
    res.status(200).send({ endpoints });
}

module.exports = { getEndpoints }