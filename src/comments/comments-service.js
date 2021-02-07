const CommentsService = {
  getAllComments(knex) {
    return knex.select('*').from('comments_table');
  },

  getById(knex, id) {
    return knex.from('comments_table').select('*').where('id', id).first();
  },

  insertComment(knex, newComments) {
    return knex
      .insert(newComments)
      .into('comments_table')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  deleteComments(knex, id) {
    return knex('comments_table').where({ id }).delete();
  },

  updateComments(knex, id, newCommentsFields) {
    return knex('comments_table').where({ id }).update(newCommentsFields);
  },
};

module.exports = CommentsService;
