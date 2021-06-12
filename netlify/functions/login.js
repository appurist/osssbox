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

    let body = JSON.parse(event.body);
    if (!body.login) return { statusCode: 401 };

    s3api.connect();

    // First let's look up the login name to find the UID for that user.
    let user = null;
    let doc = await s3api.docGet(`users/login/${body.login}.json`);
    if (doc) {
      user = JSON.parse(doc);
    } else {
      console.error(`No document to parse for user '${body.login}.`);
      return { statusCode: 401 };
    }
    if (!user?.uid) {
      console.error(`Document for user '${body.login}' does not include a UID.`)
      return { statusCode: 401 };
    }
    user.authenticated = true;

    console.log(`Login by ${user.display} (${user.login}) [${user.uid}]...`);
    let response = auth.makeToken(user);

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