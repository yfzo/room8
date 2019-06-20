exports.up = function(knex, Promise) {
  return knex.schema.createTable('polls', function (table) {
    table.increments('poll_id').primary();
    table.string('email');
    table.string('question');
    table.specificType('options', 'text[]');
    table.boolean('is_active');
    table.string('description');
    table.specificType('forward_emails', 'text[]');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('polls');
};
