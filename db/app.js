const db = require('./connection');
const express = require('express');
const app = express();
const { getEndpoints, getTopics } = require('./controller/app.controller')

app.use(express.json());

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.all('/*splat', (req, res) => {
    res.status(404).send({ msg: 'Not Found!' })
})
//End of express chain ^^
//Start of error handling middleware chain



module.exports = app;