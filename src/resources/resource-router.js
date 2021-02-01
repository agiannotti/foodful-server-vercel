const express = require('express');
const xss = require('xss');
const ResourceRouter = express.Router();
const ResourceService = require('./resource-service');

const bodyParser = express.json();

const serializeResource = (resource) => ({
  id: resource.id,
  title: xss(resource.title),
  content: xss(resource.content),
  zipcode: resource.zipcode,
  date_published: resource.date_published,
});

ResourceRouter.route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ResourceService.getAllResources(knexInstance).then((resourcedb) => {
      res.json(resourcedb.map(serializeResource));
    });
  })
  .post(bodyParser, (req, res, next) => {
    const { title, zipcode, content } = req.body;
    const newResource = {
      title,
      zipcode,
      content,
    };
    for (const field of ['title', 'zipcode', 'content'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    ResourceService.insertResource(req.app.get('db'), newResource).then(
      (resource) => {
        res.status(201).json(resource);
      }
    );
  });

ResourceRouter.route('/:id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    ResourceService.getById(knexInstance, req.params.id)
      .then((resource) => {
        if (!resource) {
          return res.status(404).json({
            error: { message: 'resource not found' },
          });
        }
        res.resource = resource;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: res.resource.id,
      title: xss(res.resource.title),
      content: xss(res.resource.content),
      zipcode: res.resource.zipcode,
      date_published: res.resource.date_published,
    });
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.id;
    ResourceService.deleteResource(knexInstance, id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const { title, zipcode, content, date_published } = req.body;
    const resourceToUpdate = {
      title,
      zipcode,
      content,
      date_published,
    };
    const valueCheck = Object.values(resourceToUpdate).filter(Boolean).length;
    if (valueCheck === 0) {
      return res.status(400).json({
        error: { message: `req body must contain all required values` },
      });
    }
    ResourceService.updateResource(
      req.app.get('db'),
      req.params.id,
      resourceToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = ResourceRouter;
