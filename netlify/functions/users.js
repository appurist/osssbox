const uuid = require('uuid-random');
const auth = require('../lib/auth');
const s3api = require('../lib/s3api');
const { getConfig } = require('../lib/config');

// A new user is format:
// {
//   "uid": "83d85a9a-27b6-475a-995d-86d26d227a72",
//   "login": "admin",
//   "display": "Administrator",
//   "email": "dev@authordesktop.com"
// }
exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);
    if (event.httpMethod !== 'POST') return { statusCode: 405 };

    let body = JSON.parse(event.body);
    let {login, password, display, email} = body;
    if (!(login && password && display && email)) return { statusCode: 400 };

    login = login.trim();
    password = password.trim();
    display = display.trim();
    email = email.trim();
    if (!(login && password && display && email)) return { statusCode: 400 };

    s3api.connect();

    // First let's request the config for later
    let config = await getConfig();
    if (!config?.registration) {
      console.error(`User '${login}' registration failed: registration is not enabled in config.json.`);
      return { statusCode: 403 };
    }

    // Now let's look up the login name to find the UID and auth info for that user.
    let doc = await s3api.docGet(`users/auth/${body.login}.json`);
    if (doc) {
      console.error(`User '${login} already exists.`);
      return { statusCode: 409 };
    }

    let uid = uuid();
    let user = {uid, login, display, email };
    let credentials = auth.makeCredentials(password);

    let result = await s3api.docPut(`users/${uid}/account.json`, user );
    result = await s3api.docPut(`auth/${login}.json`, { user, credentials });

    console.log(`Registration for ${user.display} (${user.login}) [${user.uid}]: OK`);
    let issuer = config.site;
    user = auth.makeUserResponse(user);
    user.token = auth.makeToken(user, issuer);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user, null, 2)
    };
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stack);
    }
    return { statusCode: 500 };
  }
};