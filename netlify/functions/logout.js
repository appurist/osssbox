const config = require('../lib/config');
const auth = require('../lib/auth');
const s3api = require('../lib/s3api');

// A user is format:
// {
//   "uid": "83d85a9a-27b6-475a-995d-86d26d227a72",
//   "login": "admin",
//   "display": "Administrator",
//   "email": "dev@authordesktop.com",
//   "lastIP": "",
//   "iat": 1603724219,
//   "iss": "osssbox"
// }
exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    let response = { authenticated: false };

    if (user?.authenticated) {
      console.log(`Logout by ${user.display} (${user.login}) [${user.uid}]: OK`);
    }

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