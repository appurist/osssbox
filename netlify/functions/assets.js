const path = require('path');

const uuid = require('uuid-random');

const auth = require('../lib/auth');
const s3api = require('../lib/s3api');
const chopURL = require('../lib/chopURL');

async function GetList(userId) {
  s3api.connect();

  let list = await s3api.docList(`users/${userId}/assets`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list, null, 2)
  };
}

async function ReadOne(userId, assetId) {
  s3api.connect();

  let doc = await s3api.docGet(`users/${userId}/assets/${assetId}.json`);
  return {
    statusCode: doc ? 200 : 404,
    headers: { 'Content-Type': doc ? 'application/json' : 'text/html'},
    body: doc || `User '${userId}' has no such asset '${assetId}'.`
  };
}

async function CreateDoc(userId, assetPath, json) {
  s3api.connect();

  let doc;
  try {
    //doc = JSON.parse(json);
    doc = json;
  } catch (err) {
    return {
      statusCode: 400,
      body: 'Bad JSON body: '+err.message
    };
  }

  let assetId;
  let result;
  if (assetPath) {
    assetId = path.basename(assetPath);
    if (assetId !== assetPath) {
      return { statusCode: 400, body: `Invalid asset ID: '${assetPath}'.` };
    }

    let fromPath = `incoming/${userId}/${assetId}.blob`;
    let toPath = `users/${userId}/assets/${assetId}.blob`;
    result = s3api.moveObject(fromPath, toPath);

  }
  doc.uid = assetId || uuid();

  result = await s3api.docPut(`users/${userId}/assets/${assetId}.json`, newDoc);
  console.log("CreateDoc returns:", result);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(newDoc, null, 2)
  };
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

    let parts = chopURL(event.path, 'assets');
    let assetId = '';
    if (parts[1]) {
      assetId = parts[1].trim();
    }

    // Here we implement a simple CRUD interface, plus GET for list.
    switch (event.httpMethod) {
    case 'GET':
      return assetId ? await ReadOne(user.uid, assetId) : await GetList(user.uid);
    case 'POST':
      return assetId ? { statusCode: 400 } : await CreateDoc(user.uid, assetId, event.body);
    case 'PATCH':
      return assetId ? await UpdateOne(user.uid, assetId, event.body) : { statusCode: 400 };
    case 'DELETE':
      return assetId ? await DeleteOne(user.uid, assetId) : { statusCode: 400 };
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