const auth = require('../lib/auth');
const s3api = require('../lib/s3api');

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);

    if (event.httpMethod !== 'GET') {
      let authorization = event.headers['authorization'];
      let user = auth.getAuth(authorization)
      if (!user?.authenticated) {
        return { statusCode: 401, body: "Not authorized." };
      }
    }

    s3api.connect();

    // Here we implement a simple CRUD interface, plus GET for list.
    let result;
    switch (event.httpMethod) {
    case 'GET':
      result = await s3api.getBucketLifecycleRules();
      break;
    case 'POST':
      result = await s3api.setBucketLifecycleRules();
      break;
    default:
      result = { statusCode: 405, body: `Unsupported method '${event.httpMethod}'.`};
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(result, null, 2)
    };
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stack);
    }
    return { statusCode: 500 };
  }
};