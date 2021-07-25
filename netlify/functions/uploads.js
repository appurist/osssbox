const uuid = require('uuid-random');

const s3api = require('../lib/s3api');
const auth = require('../lib/auth');
const chopURL = require('../lib/chopURL');

// The REST API sequence is to create a binary (blob) asset via POST to /uploads to get a signed upload URL, then upload there,
// and finally call DELETE /uploads/:assetId to signal move/cleanup of the temp upload and creation of the JSON metadata object.
// If DELETE is not called, assets will be eventually be auto-deleted from temp upload storage.

async function CreateSignedUpload(user, doc) {
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

async function CompleteUpload(user, assetId, doc) {
  // S3-copy assetId.json and assetId.blob to users/userId/assets, delete originals
  s3api.connect();

  try {
    // Request a signed upload URL from S3
    let meta = Object.assign({ }, doc, {uid: assetId});
    let fromKey = `incoming/${user.uid}/${assetId}.blob`;
    let toKey = `users/${user.uid}/assets/${assetId}.blob`;
    // return the URL info + meta info
    result = await s3api.objMove(fromKey, toKey, 0)
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

// A POST to /uploads withOUT an asset ID requests a pre-signed S3 upload URL for a new asset.
// A POST to /uploads WITH an asset ID confirms the S3 upload and moves the files into place.
exports.handler = async (event, /* context */ ) => {
  try {
    console.log(`${event.path} [${event.httpMethod}] from ${event.headers["client-ip"]}`);

    // First let's check the user context prerequisites (e.g. to see if registration is even allowed).
    let authorization = event.headers['authorization'];
    let user = auth.getAuth(authorization)
    if (!user?.authenticated) {
      return { statusCode: 401, body: "Not authorized." };
    }

    let parts = chopURL(event.path, 'uploads');
    let assetId = undefined;
    if (parts[1]) {
      assetId = parts[1].trim();
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
      return assetId ? await CompleteUpload(user, assetId, doc) : await CreateSignedUpload(user, doc);
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