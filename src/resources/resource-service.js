const ResourceService = {
  getAllResources(db) {
    return db.select('*').from('resource_table');
  },

  getById(knex, id) {
    return knex.from('resource_table').select('*').where('id', id).first();
  },

  insertResource(knex, newResource) {
    return knex
      .insert(newResource)
      .into('resource_table')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  deleteResource(knex, id) {
    return knex('resource_table').where({ id }).delete();
  },

  updateResource(knex, id, newResourceFields) {
    return knex('resource_table').where({ id }).update(newResourceFields);
  },
};

module.exports = ResourceService;
