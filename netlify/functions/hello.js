// const movies = require('./data.json');

exports.handler = async (event, /* context */) => {
  let who = event.path.replace('/api/hello/', '');
  who = who.replace('/api/hello', '');
  let response = who ? `Hello, ${who}.` : 'Hello there.';

  return {
    statusCode: 200,
    // body: JSON.stringify({ message: response })
    body: response
  };
};