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

    // First let's check the config prerequisites.
    if (!config.ISSUER) {
      console.error(`User '${login}' login failed: OSSSBOX_ISSUER is not defined in the environment.`);
      return { statusCode: 503 };
    }

    let body = JSON.parse(event.body);
    if (!body.login) return { statusCode: 401 };
    let login = body.login.trim();

    s3api.connect();

    // First let's look up the login name to find the UID and auth info for that user.
    let doc = await s3api.docGet(`auth/${login}.json`);
    if (!doc) {
      console.error(`No document to parse for user '${login}'.`);
      return { statusCode: 401 };
    }
    let data = JSON.parse(doc);
    if (!data?.user) {
      console.error(`Document for user '${login}' does not include a user.`)
      return { statusCode: 401 };
    }
    let user = data.user;
    if (!user?.uid) {
      console.error(`Document for user '${login}' does not include a UID.`)
      return { statusCode: 401 };
    }

    console.log(`Login by ${user.display} (${user.login}) [${user.uid}]: OK`);
    let issuer = config.ISSUER;
    user = auth.makeUserResponse(user); // make a new copy and set administrator flag if a match
    user.token = auth.makeToken(user, issuer);
    let response = user;

    return {
      statusCode: 200,
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