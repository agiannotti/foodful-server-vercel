const express = require('express');
// const xss = require('express');
const CommentsService = require('./comments-service');
const CommentsRouter = express.Router();
const bodyParser = express.json();

// -- id,content, date_created, resource_id

const serializeComment = (comment) => ({
  id: comment.id,
  content: comment.content,
  date_created: comment.date_created,
  resource_id: comment.resource_id,
});

CommentsRouter.route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    CommentsService.getAllComments(knexInstance).then((commentdb) => {
      res.json(commentdb.map(serializeComment));
    });
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { content, date_created, resource_id } = req.body;
    const newComment = {
      content,
      date_created,
      resource_id,
    };
    for (const field of ['content', 'date_created', 'resource_id'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    newComment.resource_id = Number(resource_id);

    if (resource_id) {
      newComment.date_created = date_created;
    }

    CommentsService.insertComment(knexInstance, newComment)
      .then((comment) => {
        res.status(201).json(comment);
      })
      .catch(next);
  });

CommentsRouter.route('/:id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    CommentsService.getById(knexInstance, req.params.id)
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({
            error: { message: 'comment not found' },
          });
        }
        res.comment = comment;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: res.comment.id,
      content: res.comment.content,
      date_created: res.comment.date_created,
      resource_id: res.comment.resource_id,
    });
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.id;
    CommentsService.deleteComments(knexInstance, id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { content, date_created, resource_id } = req.body;
    const commentToUpdate = {
      content,
      date_created,
      resource_id,
    };
    const valueCheck = Object.values(commentToUpdate).filter(Boolean).length;
    if (valueCheck === 0) {
      return res.status(400).json({
        error: { message: 'Must include content!' },
      });
    }
    CommentsService.updateComments(
      req.app.get('db'),
      req.params.id,
      commentToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = CommentsRouter;
