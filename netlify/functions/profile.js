const auth = require('../lib/auth');

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);
    if (event.httpMethod !== 'GET') return { statusCode: 405 };

    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    let response = user.authenticated ? `Hello, ${user.display} (${user.login}) at ${user.email}.` : 'Should I know you?';

    return {
      statusCode: user.authenticated ? 200 : 401,
      // headers: { 'Content-Type': 'application/json' },
      body: response
    };
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stackTrace);
    }
    return { statusCode: 500 };
  }
};