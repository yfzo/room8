
exports.up = function(knex, Promise) {
  return knex.raw('ALTER TABLE polls ALTER COLUMN id TYPE VARCHAR(100); ALTER TABLE submissions ALTER COLUMN poll_id TYPE VARCHAR(100); ALTER TABLE submissions ALTER COLUMN id TYPE VARCHAR(100);');
};

exports.down = function(knex, Promise) {
  return knex.raw('ALTER TABLE polls ALTER COLUMN id TYPE integer USING (id::integer); ALTER TABLE submissions ALTER COLUMN poll_id TYPE integer USING (id::integer); ALTER TABLE submissions ALTER COLUMN id TYPE integer USING (id::integer);');
};
