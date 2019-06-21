exports.seed = function(knex, Promise) {
  return knex('submissions').del()
    .then(function () {
      return knex('polls').del()
    })
    .then(function () {
      return Promise.all([
        knex('polls').insert({id: 'id', email: 'iam@gmail.com', question: 'What do we want for dinner?', options: ['Pasta', 'Pizza', 'Sushi', 'All of the above'], is_active: 't', description: 'What do you guys think we should eat tonight? I amm feeling the last option', forward_emails: ['kindof@gmail.com', 'hungry@gmail.com']}),
        knex('polls').insert({id:'ChocolateWallNailSauce', email: 'kindof@gmail.com', question: 'What streaming service should we subscribe to?', options: ['Netflix', 'Amazon Prime Video', 'Hulu', 'HBO'], is_active: 't', description: '', forward_emails: ['iam@gmail.com', 'hungry@gmail.com']}),
        knex('polls').insert({id:'SunnyMonitorShoeSmell', email: 'hungry@gmail.com', question: 'Who washes the dishes on Friday?', options: ['Mico', 'Lukas', 'Junaid', 'Yifei'], is_active: 't', description: 'Should we just rock paper scissors this', forward_emails: ['kindof@gmail.com', 'iam@gmail.com']}),
        knex('submissions').insert({id: 'id', poll_id: 'id', answers: [3, 1, 2, 4]}),
        knex('submissions').insert({id: 'TurquoiseDampDoorNews', poll_id: 'id', answers: [4, 1, 3, 2]}),
        knex('submissions').insert({id: 'PowerfulCup', poll_id: 'id', answers: [4, 1, 2, 3]}),
        knex('submissions').insert({id: 'PoshPickles', poll_id: 'id', answers: [1, 4, 2, 3]}),
        knex('submissions').insert({id: 'YouAreDoingGreat', poll_id: 'id', answers: [2, 4, 3, 1]}),
        knex('submissions').insert({id: 'RunningOutOfIdeas', poll_id: 'id', answers: [3, 4, 2, 1]}),
        knex('submissions').insert({id: 'Hey', poll_id: 'id', answers: [2, 1, 3, 4]})
      ]);
    });
};
