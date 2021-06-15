const uuid = require('uuid-random');

const s3api = require('../lib/s3api');
const auth = require('../lib/auth');

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);

    // First let's check the user context prerequisites (e.g. to see if registration is even allowed).
    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    if (!user?.authenticated) {
      return { statusCode: 401, body: "Not authorized." };
    }

    // Here we implement a simple CRUD interface, plus GET for list.
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported method '${event.httpMethod}'.`};
    }

    let assetId = uuid();
    let doc;
    try {
      doc = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: 'Bad JSON body: '+err.message
      };
    }

    s3api.connect();

    // Request a signed upload URL from S3
    let meta = Object.assign({ }, doc, {uid: assetId});
    let upload = await s3api.getUploadURL(`users/${user.uid}/assets/${assetId}.blob`);
    if (!upload) {
      return { statusCode: 500, body: `Error: Could not obtain upload URL for user '${user.uid}'.`};
    }

    // We have an upload URL, create the metadata doc and return the URL
    result = await s3api.docPut(`users/${user.uid}/assets/${assetId}.json`, meta);
    if (!result) {
      return { statusCode: 500, body: `Error: Could not store asset for user '${user.uid}'.`};
    }

    // return the URL info + meta info
    result = Object.assign({ }, { upload }, { meta })
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