const db = require('./connection');
const express = require('express');
const app = express();
const { getEndpoints, getTopics, getArticleById,  } = require('./controller/app.controller')

app.use(express.json());

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticleById)

app.all('/*splat', (req, res) => {
    res.status(404).send({ msg: 'Not Found!' })
})
//End of express chain ^^
//Start of error handling middleware chain



module.exports = app;