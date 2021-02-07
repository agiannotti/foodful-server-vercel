const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeResourceArray } = require('./foodful.fixtures');

describe('Resources Endpoints', function () {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE resource_table'));

  afterEach('cleanup', () => db.raw('TRUNCATE resource_table'));

  describe(`GET /api/resources`, () => {
    context(`Given there are resources in the database`, () => {
      const testResources = makeResourceArray();

      beforeEach('insert resources', () => {
        return db.into('resource_table').insert(testResources).returning('*');
      });

      it(`Responds with 200 and a list of all of the resources`, () => {
        return supertest(app)
          .get('/api/resources')
          .expect(
            200,
            testResources.map((resource) => {
              return { ...resource };
            })
          );
      });
    });
  });
  describe(`GET /api/resources/:id`, () => {
    context('Given there are resources in the database', () => {
      const testResources = makeResourceArray();

      beforeEach('insert resources', () => {
        return db.into('resource_table').insert(testResources).returning('*');
      });

      it('responds with 200 and the specified resource', () => {
        const resourceId = 2;
        const expectedresource = testResources[resourceId - 1];

        return supertest(app)
          .get(`/api/resources/${resourceId}`)
          .expect(200, expectedresource);
      });
    });
  });

  describe(`PATCH /api/resources/:resource_id`, () => {
    context('Given there are resources in the database', () => {
      const testResources = makeResourceArray();
      beforeEach('insert resources', () => {
        return db.into('resource_table').insert(testResources).returning('*');
      });

      it('responds with 204 and updates the resource', () => {
        const idToUpdate = 2;
        const updateresource = {
          title: 'updated resource name',
          date_published: '2021-02-01T03:01:17.027Z',
          id: 2,
          content: 'updated content',
          zipcode: '123123',
        };

        const expectedresource = {
          ...testResources[idToUpdate - 1],
          ...updateresource,
        };

        return supertest(app)
          .patch(`/api/resources/${idToUpdate}`)
          .send(updateresource)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/resources/${idToUpdate}`)
              .expect(expectedresource)
          );
      });
    });
  });

  describe(`DELETE /api/resources/:resource_id`, () => {
    context(`Given there are resources in the database`, () => {
      const testResources = makeResourceArray();

      beforeEach('insert resources', () => {
        return db.into('resource_table').insert(testResources).returning('*');
      });

      it('responds with 204 and removes the resource', () => {
        const resourceToRemove = 2;
        const expectedresources = testResources.filter(
          (resource) => resource.id !== resourceToRemove
        );
        return supertest(app)
          .delete(`/api/resources/${resourceToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/resources`)
              .expect(
                expectedresources.map((resource) => {
                  return { ...resource };
                })
              )
          );
      });
    });
  });
});
