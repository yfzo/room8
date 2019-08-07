exports.up = function(knex, Promise) {
  return knex.schema.createTable('submissions', function (table) {
    table.string('id').primary();
    table.string('poll_id').references('polls');
    table.specificType('answers', 'INT[]');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('submissions');
};
