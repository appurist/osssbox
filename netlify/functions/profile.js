const auth = require('../lib/auth');

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);
    if (event.httpMethod !== 'GET') return { statusCode: 405 };

    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    let response = user?.authenticated ? user : { authenticated: false };

    return {
      statusCode: user.authenticated ? 200 : 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response, null, 2)
    };
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stackTrace);
    }
    return { statusCode: 500 };
  }
};