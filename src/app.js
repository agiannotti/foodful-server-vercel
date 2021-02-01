require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { NODE_ENV } = require('./config');
const cors = require('cors');
const helmet = require('helmet');
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
const errorHandler = require('./error-handler');
// const logger = require('/logger');
const ResourceRouter = require('./resources/resource-router');
const CommentsRouter = require('./comments/comments-router');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan(morganOption));

app.use('/api/comments', CommentsRouter);
app.use('/api/resources', ResourceRouter);

app.get('/', (req, res) => {
  res.send('Hello, Server!');
});

app.use(errorHandler);

module.exports = app;
