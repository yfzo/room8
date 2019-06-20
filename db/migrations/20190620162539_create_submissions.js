exports.up = function(knex, Promise) {
  return knex.schema.createTable('submissions', function (table) {
    table.increments('sub_id').primary();
    table.foreign('poll_id').references('polls');
    table.specificType('answers', 'INT[]');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('submissions');
};
