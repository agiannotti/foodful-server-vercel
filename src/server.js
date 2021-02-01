/* eslint-disable no-console */
const app = require('./app');
const knex = require('knex');
const { PORT, DATABASE_URL } = require('./config');

// console.log('CONNECTION', DATABASE_URL);

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

// db.select('*')
//   .from('resource_table')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

app.set('db', db);

app.listen(PORT, () =>
  console.log(`Server listening at http://localhost:${PORT}`)
);
