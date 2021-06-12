const auth = require('../lib/auth');

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    let user = JSON.parse(event.body);
    console.log(`Login by ${user.login}...`);
    let response = { login: user.login, authenticated: true };

    return {
      statusCode: user.authenticated ? 200 : 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response, null, 2)
    };
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stack);
    }
    return { statusCode: 500 };
  }
};