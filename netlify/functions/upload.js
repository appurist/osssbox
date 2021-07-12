const uuid = require('uuid-random');

const s3api = require('../lib/s3api');
const auth = require('../lib/auth');
const chopURL = require('../lib/chopURL');

// The REST API sequence is to create a binary (blob) asset via POST to /upload to get a signed upload URL, then upload there,
// and finally call DELETE /upload/:assetId to signal move/cleanup of the temp upload and creation of the JSON metadata object.
// If DELETE is not called, assets will be eventually be auto-deleted from temp upload storage.

async function CreateUpload(user, doc) {
  let assetId = uuid();

  s3api.connect();

  try {
    // Request a signed upload URL from S3
    let meta = Object.assign({ }, doc, {uid: assetId});
    let prefix = `incoming/${user.uid}/`; // does not include fn extension
    let fn = `${assetId}.blob`; // does not include fn extension
    let upload = await s3api.getUploadURL(prefix, fn);
    if (!upload) {
      return { statusCode: 500, body: `Error: Could not obtain upload URL for user '${user.uid}'.`};
    }
    // return the URL info + meta info
    result = Object.assign({ }, { upload }, { meta })
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(result, null, 2)
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: 'Bad JSON body: '+err.message
    };
  }
}

async function CompleteUpload(userId, assetId) {
  // TODO: S3-copy assetId.json and assetId.blob to users/userId/assets, delete originals
  return { statusCode: 200, body: 'Not implemented yet.'}
}

exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);

    // First let's check the user context prerequisites (e.g. to see if registration is even allowed).
    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    if (!user?.authenticated) {
      return { statusCode: 401, body: "Not authorized." };
    }

    if (event.httpMethod === 'GET') {
      return await CreateUpload( user, { } );
    }

    let parts = chopURL(event.path, 'upload');
    let assetId = undefined;
    if (parts[1]) {
      assetId = parts[1].trim();
    }

    // Here we implement a simple CRUD interface, plus GET for list.
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: `Unsupported method '${event.httpMethod}'.`};
    }

    // It's a new asset, give it a new asset ID and presigned URL for upload
    let doc;
    try {
      doc = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: 'Bad JSON body: '+err.message
      };
    }

    // Here we implement a simple CRUD interface, plus GET for list.
    switch (event.httpMethod) {
    case 'POST':
      return assetId ? { statusCode: 400 } : await CreateUpload(user, doc);
    case 'DELETE':
      return assetId ? await CompleteUpload(user.uid, assetId) : { statusCode: 400, body: 'Upload completion without asset ID.'};
    default:
      return { statusCode: 405, body: `Unsupported method '${event.httpMethod}'.`};
    }
  } catch (err) {
    console.error("Exception:", err.message);
    if (err.stack) {
      console.log(err.stack);
    }
    return { statusCode: 500 };
  }
};