
exports.up = function(knex, Promise) {
  return knex.schema
    .table('polls', table => {
      table.renameColumn('poll_id', 'id');
    })
    .table('submissions', table => {
      table.renameColumn('sub_id', 'id');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('polls', table => {
      table.renameColumn('id', 'poll_id');
    })
    .table('submissions', table => {
      table.renameColumn('id', 'sub_id');
    });
};
