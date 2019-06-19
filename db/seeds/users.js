exports.seed = function(knex, Promise) {
  return knex('polls').del()
    .then(function () {
      return Promise.all([
        knex('polls').insert({id: 1, name: 'What do we want for dinner?'}),
        knex('polls').insert({id: 2, name: 'What streaming service should we subscribe to?'}),
        knex('polls').insert({id: 3, name: 'Who washes the dishes on Friday?'})
      ]);
    });
};
